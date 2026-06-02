const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb+srv://sims:Y8ER5uHBsjK8gWyS@cluster0.qfy9fat.mongodb.net/inventory_management?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    console.log('Connected to DB');
    const result = await Order.deleteMany({ status: 'Pending' });
    console.log(`Deleted ${result.deletedCount} dummy orders.`);
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
