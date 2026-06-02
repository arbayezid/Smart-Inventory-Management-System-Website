const express = require('express');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Middleware to ensure superadmin
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'SuperAdmin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as SuperAdmin' });
  }
};

// 1. Get Dashboard Stats (Total Shops, Active Subs, MRR, New Shops)
router.get('/dashboard-stats', protect, superAdminOnly, async (req, res) => {
  try {
    const shops = await User.find({ role: { $ne: 'SuperAdmin' } });
    const totalShops = shops.length;
    const activeSubs = shops.filter(s => s.status === 'Active').length;
    
    // Calculate MRR (Basic: 20, Premium: 50, Enterprise: 100)
    let mrr = 0;
    shops.forEach(s => {
      const plan = s.plan || 'Basic';
      if(s.status === 'Active') {
         if(plan === 'Basic') mrr += 20;
         else if(plan === 'Premium') mrr += 50;
         else if(plan === 'Enterprise') mrr += 100;
      }
    });

    // New shops this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newShops = shops.filter(s => {
      if(!s.createdAt) return false;
      const d = new Date(s.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    res.json({ totalShops, activeSubs, mrr, newShops });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get All Shops specifically formatted for All Shops table
router.get('/shops', protect, superAdminOnly, async (req, res) => {
  try {
    const shops = await User.find({ role: { $ne: 'SuperAdmin' } }).sort({ createdAt: -1 });
    const formattedShops = shops.map(s => {
       const plan = s.plan || 'Basic';
       const subStatus = s.status || (s.isActive ? 'Active' : 'Restricted');
       
       let mrrVal = 0;
       if(plan === 'Basic') mrrVal = 20;
       else if(plan === 'Premium') mrrVal = 50;
       else if(plan === 'Enterprise') mrrVal = 100;

       return {
         id: s._id,
         name: s.shopName || s.name || "Unnamed Shop",
         owner: s.email,
         plan: plan,
         mrr: `$${mrrVal}`,
         status: subStatus,
         joinedDate: s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown"
       }
    });
    res.json(formattedShops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2.5 Create a new Shop manually
router.post('/shops', protect, superAdminOnly, async (req, res) => {
  try {
    const { email, shopName, plan, status } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User with this email already exists' });

    const newUser = await User.create({
      firebaseUid: `pending-${email}-${Date.now()}`,
      email,
      name: shopName || 'New Shop',
      shopName: shopName || 'New Shop',
      role: 'ShopOwner',
      plan: plan || 'Basic',
      status: 'Active',
      isActive: true
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2.6 Approve Shop Request
router.put('/shops/:id/approve', protect, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'SuperAdmin') return res.status(400).json({ message: 'Cannot modify a Super Admin' });

    user.status = 'Active';
    user.isActive = true;
    await user.save();
    
    res.json({ message: 'Shop approved successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2.7 Reject Shop Request
router.put('/shops/:id/reject', protect, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'SuperAdmin') return res.status(400).json({ message: 'Cannot modify a Super Admin' });

    user.status = 'Rejected';
    user.isActive = false;
    await user.save();
    
    res.json({ message: 'Shop rejected successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get Subscription data
router.get('/subscriptions', protect, superAdminOnly, async (req, res) => {
    try {
        const shops = await User.find({ role: { $ne: 'SuperAdmin' } });
        const activeShops = shops.filter(s => s.status === 'Active');

        const basicUsers = activeShops.filter(s => (s.plan || 'Basic') === 'Basic').length;
        const premiumUsers = activeShops.filter(s => s.plan === 'Premium').length;
        const enterpriseUsers = activeShops.filter(s => s.plan === 'Enterprise').length;
        
        res.json({ basicUsers, premiumUsers, enterpriseUsers });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Get Revenue data
router.get('/revenue', protect, superAdminOnly, async (req, res) => {
    try {
        const shops = await User.find({ role: { $ne: 'SuperAdmin' } });
        const activeShops = shops.filter(s => s.status === 'Active');

        let basicRev = 0, premiumRev = 0, enterpriseRev = 0;
        activeShops.forEach(s => {
             const plan = s.plan || 'Basic';
             if(plan === 'Basic') basicRev += 20;
             else if(plan === 'Premium') premiumRev += 50;
             else if(plan === 'Enterprise') enterpriseRev += 100;
        });
        const mrr = basicRev + premiumRev + enterpriseRev;
        const arr = mrr * 12;

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const d = new Date();
        const chartData = [
           { name: months[(d.getMonth() - 2 + 12) % 12], revenue: Math.round(mrr * 0.8) },
           { name: months[(d.getMonth() - 1 + 12) % 12], revenue: Math.round(mrr * 0.9) },
           { name: months[d.getMonth()], revenue: mrr },
        ];

        res.json({
            mrr, 
            arr, 
            basicRev, 
            premiumRev, 
            enterpriseRev,
            totalShops: activeShops.length,
            churnRate: 1.2,
            chartData
        });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

const Settings = require('../models/Settings');

// 5. Get Settings
router.get('/settings', protect, superAdminOnly, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if(!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

// 6. Update Settings
router.put('/settings', protect, superAdminOnly, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if(!settings) {
            settings = await Settings.create({});
        }
        const updated = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
        res.json(updated);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
