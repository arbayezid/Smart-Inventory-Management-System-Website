const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['SuperAdmin', 'ShopOwner'], default: 'ShopOwner' },
  shopName: { type: String }, // For ShopOwner
  isActive: { type: Boolean, default: true }, // Legacy boolean, phasing out in favor of status
  status: { type: String, enum: ['Pending', 'Active', 'Rejected', 'Restricted'], default: 'Pending' },
  // Subscription & Billing details
  plan: { type: String, enum: ['Basic', 'Premium', 'Enterprise'], default: 'Basic' },
  subscriptionStatus: { type: String, default: 'Trial' },
  trialEndsAt: { type: Date }
}, { timestamps: true });

// Set default trialEndsAt to 14 days from creation
userSchema.pre('save', function(next) {
  if (this.isNew && this.role === 'ShopOwner' && !this.trialEndsAt) {
    this.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
