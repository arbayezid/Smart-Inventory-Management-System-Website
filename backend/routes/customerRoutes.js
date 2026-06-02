const express = require('express');
const Customer = require('../models/Customer');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'SuperAdmin' ? {} : { shopId: req.user._id };
    const customers = await Customer.find(filter);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (req.user.role !== 'SuperAdmin' && customer.shopId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const customerData = { ...req.body, shopId: req.user._id };
    const customer = new Customer(customerData);
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (req.user.role !== 'SuperAdmin' && customer.shopId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (req.user.role !== 'SuperAdmin' && customer.shopId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
