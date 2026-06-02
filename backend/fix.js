const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Customer = require('./models/Customer');

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sims:Y8ER5uHBsjK8gWyS@cluster0.qfy9fat.mongodb.net/inventory_management?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const owner = await User.findOne({ role: 'ShopOwner' });
    if (!owner) {
        console.log('No shop owner found');
        process.exit(0);
    }
    const shopId = owner._id;
    // Update documents where shopId does not exist or is null
    const p = await Product.updateMany({ shopId: { $exists: false } }, { $set: { shopId } });
    const o = await Order.updateMany({ shopId: { $exists: false } }, { $set: { shopId } });
    const c = await Customer.updateMany({ shopId: { $exists: false } }, { $set: { shopId } });
    
    // Also update any that might be null
    const p2 = await Product.updateMany({ shopId: null }, { $set: { shopId } });
    const o2 = await Order.updateMany({ shopId: null }, { $set: { shopId } });
    const c2 = await Customer.updateMany({ shopId: null }, { $set: { shopId } });
    
    console.log('Products:', p.modifiedCount + p2.modifiedCount, 'Orders:', o.modifiedCount + o2.modifiedCount, 'Customers:', c.modifiedCount + c2.modifiedCount);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
