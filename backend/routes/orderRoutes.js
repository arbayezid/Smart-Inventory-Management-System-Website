const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// POS Checkout Sync Endpoint
router.post('/checkout', protect, async (req, res) => {
  try {
    const { customerName, customerPhone, cart, totalAmount } = req.body;
    const shopId = req.user._id;

    // 1. Customer Upsert Logic
    let customer;
    const searchName = customerName || "Walk-in Customer";

    if (customerPhone) {
      customer = await Customer.findOne({ shopId, phone: customerPhone });
    }
    
    if (!customer) {
      customer = await Customer.findOne({ shopId, name: searchName });
    }
    
    if (customer) {
      // Update existing customer
      customer.totalOrders += 1;
      customer.totalAmount += totalAmount;
      if (customerPhone && !customer.phone && searchName !== "Walk-in Customer") {
        customer.phone = customerPhone;
      }
      await customer.save();
    } else {
      // Create new customer
      customer = new Customer({
        shopId,
        name: searchName,
        phone: customerPhone || undefined,
        totalOrders: 1,
        totalAmount: totalAmount
      });
      await customer.save();
    }

    // 2. Inventory Depletion & Format Order Products
    const orderProducts = [];
    for (const item of cart) {
      const product = await Product.findOne({ _id: item.id, shopId });
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.quantity < item.qty) {
        return res.status(400).json({ message: `Not enough stock for ${item.name}` });
      }
      
      // Deplete inventory
      product.quantity -= item.qty;
      await product.save();

      orderProducts.push({
        product: product._id,
        quantity: item.qty,
        price: item.price
      });
    }

    // 3. Create Order
    const order = new Order({
      shopId,
      customer: customer._id,
      products: orderProducts,
      totalAmount: totalAmount,
      status: 'Delivered' // Since it's POS, it's instantly delivered
    });

    const newOrder = await order.save();

    res.status(201).json({ message: 'Checkout successful', order: newOrder, customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'SuperAdmin' ? {} : { shopId: req.user._id };
    const orders = await Order.find(filter).populate('customer').populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer').populate('products.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'SuperAdmin' && order.shopId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const orderData = { ...req.body, shopId: req.user._id };
    const order = new Order(orderData);
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'SuperAdmin' && order.shopId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'SuperAdmin' && order.shopId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
