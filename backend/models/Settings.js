const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'Smart Inventory SaaS' },
  supportEmail: { type: String, default: 'support@smartinventory.com' },
  contactNumber: { type: String, default: '+880 1234 567890' },
  enableNewRegistrations: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
