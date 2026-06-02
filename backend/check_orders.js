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
    const orders = await Order.find();
    console.log(`Remaining orders: ${orders.length}`);
    for(const o of orders) {
       console.log(`- ${o._id}, Amount: ${o.totalAmount}, Status: ${o.status}, Date: ${o.createdAt}`);
    }
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
