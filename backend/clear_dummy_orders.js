const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not defined. Please set it in your .env file.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const result = await Order.deleteMany({ status: 'Pending' });
    console.log(`Deleted ${result.deletedCount} dummy orders.`);
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
