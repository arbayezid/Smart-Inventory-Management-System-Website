const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb+srv://sims:Y8ER5uHBsjK8gWyS@cluster0.qfy9fat.mongodb.net/inventory_management?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const orders = await Order.find();
    console.log(`Remaining orders: ${orders.length}`);
    for(const o of orders) {
       console.log(`- ${o._id}, Amount: ${o.totalAmount}, Status: ${o.status}, Date: ${o.createdAt}`);
    }
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
