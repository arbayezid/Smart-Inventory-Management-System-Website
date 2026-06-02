const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  totalOrders: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

// We remove the unique constraints on email and phone to allow multiple walk-in customers.
// Mongoose won't automatically drop existing indexes, so we will need to drop them in MongoDB.
// I have removed: customerSchema.index({ shopId: 1, email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Customer', customerSchema);
