const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not defined. Please set it in your .env file.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const collections = await db.collections();
    const customersCollection = collections.find(c => c.collectionName === 'customers');
    
    if (customersCollection) {
      const indexes = await customersCollection.indexes();
      console.log('Current indexes:', indexes.map(i => i.name));
      
      for (let index of indexes) {
        if (index.name !== '_id_') {
          console.log(`Dropping index ${index.name}...`);
          try {
            await customersCollection.dropIndex(index.name);
            console.log(`Successfully dropped ${index.name}`);
          } catch (err) {
            console.error(`Failed to drop ${index.name}:`, err.message);
          }
        }
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
