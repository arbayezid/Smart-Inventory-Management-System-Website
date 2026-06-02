const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Get all products for the logged in shop owner
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'SuperAdmin' ? {} : { shopId: req.user._id };
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single product
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'SuperAdmin' && product.shopId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this product' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product
router.post('/', protect, async (req, res) => {
  try {
    const productData = { ...req.body, shopId: req.user._id };
    const product = new Product(productData);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'SuperAdmin' && product.shopId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'SuperAdmin' && product.shopId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sell product
router.post('/:id/sell', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const sellQty = parseInt(quantity);
    if (!sellQty || sellQty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'SuperAdmin' && product.shopId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (product.quantity < sellQty) {
      return res.status(400).json({ message: 'Not enough stock. Available: ' + product.quantity });
    }

    product.quantity -= sellQty;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
