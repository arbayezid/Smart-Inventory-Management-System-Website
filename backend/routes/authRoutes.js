const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Please set it in your .env file.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Sync Firebase Register / Create MongoDB User
// @route   POST /api/auth/sync
// @access  Public
router.post('/sync', async (req, res) => {
  const { firebaseUid, email, name, role, shopName } = req.body;

  try {
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
    }

    if (user && user.role !== 'SuperAdmin') {
      if (user.status === 'Pending') {
        return res.status(403).json({ message: 'Shop request sent. Waiting for admin approval.' });
      }
      if (user.status === 'Rejected') {
        return res.status(403).json({ message: 'Shop rejected. Please contact the Admin.' });
      }
      if (user.status === 'Restricted' || !user.isActive) {
        return res.status(403).json({ message: 'Shop Restricted. Please contact the Admin.' });
      }
    }

    let isNewUser = false;
    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        name,
        role: role || 'ShopOwner',
        shopName: shopName || 'My Shop',
        status: 'Pending',
        isActive: false
      });
      isNewUser = true;
    } else {
      let requiresSave = false;
      if (shopName && shopName !== 'My Shop' && user.shopName !== shopName) {
        user.shopName = shopName;
        requiresSave = true;
      }
      // If we got a real name (not just the email from AuthContext's quick sync) and it's different.
      if (name && name !== user.email && user.name !== name) {
        user.name = name;
        requiresSave = true;
      }
      if (requiresSave) {
        await user.save();
      }
    }

    if (isNewUser) {
      return res.status(403).json({ message: 'Shop request sent. Waiting for admin approval.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shopName: user.shopName,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get All Users (Super Admin only)
// @route   GET /api/auth/users
// @access  Private/SuperAdmin
const { protect, superAdmin } = require('../middlewares/authMiddleware');
router.get('/users', protect, superAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Toggle Shop Owner Active Status
// @route   PUT /api/auth/users/:id/toggle-status
// @access  Private/SuperAdmin
router.put('/users/:id/toggle-status', protect, superAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'SuperAdmin') return res.status(400).json({ message: 'Cannot deactivate a Super Admin' });

    user.isActive = !user.isActive;
    user.status = user.isActive ? 'Active' : 'Restricted';
    await user.save();
    
    res.json({ message: `User ${user.isActive ? 'activated' : 'restricted'} successfully`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// ═══════════════════════════════════════════════════════════════
// REVENUE ANALYTICS ENDPOINT
// ═══════════════════════════════════════════════════════════════

// @desc    Get Revenue Page Analytics
// @route   GET /api/auth/dashboard/revenue-analytics
// @access  Private
router.get('/dashboard/revenue-analytics', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'SuperAdmin' ? {} : { shopId: req.user._id };
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const now = new Date();
    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;

    // --- 1. Revenue Cards: Current Year vs Previous Year ---
    const currentYearStart = new Date(currentYear, 0, 1);
    const previousYearStart = new Date(previousYear, 0, 1);
    const previousYearEnd = new Date(currentYear, 0, 1);

    const currentYearOrders = await Order.find({
      ...filter,
      status: { $ne: 'Cancelled' },
      createdAt: { $gte: currentYearStart }
    }).populate('products.product');

    const previousYearOrders = await Order.find({
      ...filter,
      status: { $ne: 'Cancelled' },
      createdAt: { $gte: previousYearStart, $lt: previousYearEnd }
    }).populate('products.product');

    const calcTotals = (orders) => {
      let totalSales = 0;
      let totalCost = 0;
      orders.forEach(order => {
        totalSales += order.totalAmount;
        order.products.forEach(item => {
          if (item.product) {
            // Estimate cost as 60% of sale price
            totalCost += item.price * item.quantity * 0.6;
          }
        });
      });
      return { totalSales: Math.round(totalSales), totalCost: Math.round(totalCost), revenue: Math.round(totalSales - totalCost) };
    };

    const currentTotals = calcTotals(currentYearOrders);
    const previousTotals = calcTotals(previousYearOrders);

    const pctChange = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

    const salesPct = pctChange(currentTotals.totalSales, previousTotals.totalSales);
    const revenuePct = pctChange(currentTotals.revenue, previousTotals.revenue);
    const costPct = pctChange(currentTotals.totalCost, previousTotals.totalCost);

    // All-time revenue
    const allOrders = await Order.find({ ...filter, status: { $ne: 'Cancelled' } });
    const allTimeTotalSales = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const revenueCards = [
      {
        isMoney: true,
        number: currentTotals.totalSales.toLocaleString(),
        percentage: Math.abs(salesPct),
        upOrDown: salesPct >= 0 ? 'up' : 'down',
        color: salesPct >= 0 ? 'green' : 'red',
        title: 'Total Sales This Year',
        subTitle: 'vs prev year',
      },
      {
        isMoney: true,
        number: currentTotals.revenue.toLocaleString(),
        percentage: Math.abs(revenuePct),
        upOrDown: revenuePct >= 0 ? 'up' : 'down',
        color: revenuePct >= 0 ? 'green' : 'red',
        title: 'Revenue This Year',
        subTitle: 'vs prev year',
      },
      {
        isMoney: true,
        number: currentTotals.totalCost.toLocaleString(),
        percentage: Math.abs(costPct),
        upOrDown: costPct >= 0 ? 'up' : 'down',
        color: costPct >= 0 ? 'red' : 'green',
        title: 'Cost This Year',
        subTitle: 'vs prev year',
      },
      {
        isMoney: true,
        number: Math.round(allTimeTotalSales).toLocaleString(),
        percentage: undefined,
        title: 'Revenue Total',
        subTitle: 'vs prev year',
      },
    ];

    // --- 2. Revenue & Cost Monthly Chart (12 months of current year) ---
    const revenueMonthly = Array(12).fill(0);
    const costMonthly = Array(12).fill(0);

    currentYearOrders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      revenueMonthly[month] += order.totalAmount;
      order.products.forEach(item => {
        if (item.product) {
          costMonthly[month] += item.price * item.quantity * 0.6;
        }
      });
    });

    const revenueCostChart = {
      categories: monthLabels,
      series: [
        { name: 'Revenue', type: 'column', data: revenueMonthly.map(v => Math.round(v)) },
        { name: 'Cost', type: 'column', data: costMonthly.map(v => Math.round(v)) },
      ],
    };

    // --- 3. Best-Selling Products Weekly (line chart - top 5 by week days) ---
    const toDayIndex = (date) => ((new Date(date).getDay() + 6) % 7);
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    currentWeekStart.setHours(0, 0, 0, 0);

    const weeklyOrders = await Order.find({
      ...filter,
      status: { $ne: 'Cancelled' },
      createdAt: { $gte: currentWeekStart }
    }).populate('products.product');

    const productDayMap = {};
    weeklyOrders.forEach(order => {
      const dayIdx = toDayIndex(order.createdAt);
      order.products.forEach(item => {
        if (item.product) {
          const pName = item.product.name;
          if (!productDayMap[pName]) productDayMap[pName] = { total: 0, days: [0, 0, 0, 0, 0, 0, 0] };
          productDayMap[pName].days[dayIdx] += item.quantity;
          productDayMap[pName].total += item.quantity;
        }
      });
    });

    const top5Weekly = Object.entries(productDayMap)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([name, info]) => ({ name, data: info.days }));

    const bestSellingWeekly = {
      categories: dayLabels,
      series: top5Weekly.length > 0 ? top5Weekly : [{ name: 'No Data', data: [0, 0, 0, 0, 0, 0, 0] }],
    };

    // --- 4. Best-Selling Products Yearly (horizontal bar - top 5 by total revenue) ---
    const productYearlyMap = {};
    currentYearOrders.forEach(order => {
      order.products.forEach(item => {
        if (item.product) {
          const pName = item.product.name;
          if (!productYearlyMap[pName]) productYearlyMap[pName] = 0;
          productYearlyMap[pName] += item.quantity * item.price;
        }
      });
    });

    const top5Yearly = Object.entries(productYearlyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const bestSellingYearly = {
      categories: top5Yearly.length > 0 ? top5Yearly.map(([name]) => name) : ['No Products'],
      series: [{ data: top5Yearly.length > 0 ? top5Yearly.map(([, amount]) => Math.round(amount)) : [0] }],
    };

    res.json({ revenueCards, revenueCostChart, bestSellingWeekly, bestSellingYearly });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// GROWTH ANALYTICS ENDPOINT
// ═══════════════════════════════════════════════════════════════

// @desc    Get Growth Page Analytics
// @route   GET /api/auth/dashboard/growth-analytics
// @access  Private
router.get('/dashboard/growth-analytics', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'SuperAdmin' ? {} : { shopId: req.user._id };
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const toDayIndex = (date) => ((new Date(date).getDay() + 6) % 7);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    currentWeekStart.setHours(0, 0, 0, 0);
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    // --- 1. Growth Cards ---
    const currentMonthOrders = await Order.countDocuments({ ...filter, createdAt: { $gte: currentMonthStart } });
    const previousMonthOrders = await Order.countDocuments({ ...filter, createdAt: { $gte: previousMonthStart, $lt: currentMonthStart } });

    const totalCustomers = await Customer.countDocuments(filter);
    const previousYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const previousYearEnd = new Date(now.getFullYear(), 0, 1);
    const previousYearCustomers = await Customer.countDocuments({ ...filter, createdAt: { $gte: previousYearStart, $lt: previousYearEnd } });

    const totalProducts = await Product.countDocuments(filter);
    const previousMonthProducts = await Product.countDocuments({ ...filter, createdAt: { $lt: currentMonthStart } });

    const orderPct = previousMonthOrders === 0 ? (currentMonthOrders > 0 ? 100 : 0) : Math.round(((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100);
    const customerPct = previousYearCustomers === 0 ? (totalCustomers > 0 ? 100 : 0) : Math.round(((totalCustomers - previousYearCustomers) / previousYearCustomers) * 100);
    const productPct = previousMonthProducts === 0 ? (totalProducts > 0 ? 100 : 0) : Math.round(((totalProducts - previousMonthProducts) / previousMonthProducts) * 100);

    const growthCards = [
      {
        isMoney: false,
        number: String(currentMonthOrders),
        percentage: Math.abs(orderPct),
        upOrDown: orderPct >= 0 ? 'up' : 'down',
        color: orderPct >= 0 ? 'green' : 'red',
        title: 'Orders Per Month',
        subTitle: 'vs prev month',
      },
      {
        isMoney: false,
        number: String(totalCustomers),
        percentage: Math.abs(customerPct),
        upOrDown: customerPct >= 0 ? 'up' : 'down',
        color: customerPct >= 0 ? 'green' : 'red',
        title: 'Total Customer',
        subTitle: 'vs prev year',
      },
      {
        isMoney: false,
        number: String(totalProducts),
        percentage: Math.abs(productPct),
        upOrDown: productPct >= 0 ? 'up' : 'down',
        color: productPct >= 0 ? 'green' : 'red',
        title: 'Total Product',
        subTitle: 'vs prev month',
      },
      {
        isMoney: false,
        number: String(totalCustomers + totalProducts),
        percentage: '30',
        title: 'Total Visitors',
        color: 'green',
        subTitle: 'vs prev week',
      },
    ];

    // --- 2. Sales Growth Over The Year (monthly revenue growth %) ---
    const currentYear = now.getFullYear();
    const currentYearStart = new Date(currentYear, 0, 1);
    const yearOrders = await Order.find({ ...filter, status: { $ne: 'Cancelled' }, createdAt: { $gte: currentYearStart } });

    const salesByMonth = Array(12).fill(0);
    yearOrders.forEach(order => {
      salesByMonth[new Date(order.createdAt).getMonth()] += order.totalAmount;
    });

    const salesGrowth = salesByMonth.map((val, i) => {
      if (i === 0) return 0;
      const prev = salesByMonth[i - 1];
      return prev === 0 ? (val > 0 ? 100 : 0) : Math.round(((val - prev) / prev) * 100);
    });

    const salesGrowthChart = {
      categories: monthLabels,
      series: [{ name: 'Revenue', type: 'column', data: salesGrowth }],
    };

    // --- 3. Product Growth (current vs previous week) ---
    const currentWeekProducts = await Order.find({
      ...filter, createdAt: { $gte: currentWeekStart }
    }).populate('products.product');

    const previousWeekProducts = await Order.find({
      ...filter, createdAt: { $gte: previousWeekStart, $lt: currentWeekStart }
    }).populate('products.product');

    const aggregateProductsByDay = (orders) => {
      const daily = [0, 0, 0, 0, 0, 0, 0];
      orders.forEach(order => {
        const dayIdx = toDayIndex(order.createdAt);
        order.products.forEach(item => { daily[dayIdx] += item.quantity; });
      });
      return daily;
    };

    const productGrowthChart = {
      categories: dayLabels,
      series: [
        { name: 'Current Week', data: aggregateProductsByDay(currentWeekProducts) },
        { name: 'Previous Week', data: aggregateProductsByDay(previousWeekProducts) },
      ],
    };

    // --- 4. Customer Growth (current vs previous week new customers) ---
    const currentWeekCustomers = await Customer.find({ ...filter, createdAt: { $gte: currentWeekStart } });
    const previousWeekCustomers = await Customer.find({ ...filter, createdAt: { $gte: previousWeekStart, $lt: currentWeekStart } });

    const aggregateCustomersByDay = (customers) => {
      const daily = [0, 0, 0, 0, 0, 0, 0];
      customers.forEach(c => { daily[toDayIndex(c.createdAt)] += 1; });
      return daily;
    };

    const customerGrowthChart = {
      categories: dayLabels,
      series: [
        { name: 'Current Week', data: aggregateCustomersByDay(currentWeekCustomers) },
        { name: 'Previous Week', data: aggregateCustomersByDay(previousWeekCustomers) },
      ],
    };

    // --- 5. Visitors (simulated from orders per day: active = completed, bounce = cancelled/pending) ---
    const allWeekOrders = await Order.find({ ...filter, createdAt: { $gte: currentWeekStart } });
    const activeVisitors = [0, 0, 0, 0, 0, 0, 0];
    const bounceVisitors = [0, 0, 0, 0, 0, 0, 0];
    allWeekOrders.forEach(order => {
      const dayIdx = toDayIndex(order.createdAt);
      if (['Delivered', 'Shipped', 'Processing'].includes(order.status)) {
        activeVisitors[dayIdx] += 1;
      } else {
        bounceVisitors[dayIdx] += 1;
      }
    });

    const visitorsChart = {
      categories: dayLabels,
      series: [
        { name: 'Active Visitors', type: 'column', data: activeVisitors },
        { name: 'Bounce Visitors', type: 'column', data: bounceVisitors },
      ],
    };

    res.json({ growthCards, salesGrowthChart, productGrowthChart, customerGrowthChart, visitorsChart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// REPORTS ENDPOINT
// ═══════════════════════════════════════════════════════════════

// @desc    Get Report Data (filtered by type and date range)
// @route   GET /api/auth/dashboard/reports?type=Item+Sales&from=2024-01-01&to=2024-12-31
// @access  Private
router.get('/dashboard/reports', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'SuperAdmin' ? {} : { shopId: req.user._id };
    const { type, from, to } = req.query;

    // Date filter
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.$lte = toDate;
    }
    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }

    const reportType = type || 'Item Sales';

    if (reportType === 'Inventory Status') {
      // Inventory Status Report - product-level stock info
      const productFilter = req.user.role === 'SuperAdmin' ? {} : { shopId: req.user._id };
      const products = await Product.find(productFilter).sort({ quantity: 1 });

      const rows = products.map(p => ({
        productName: p.name,
        sku: p.sku,
        category: p.category || 'N/A',
        supplier: p.supplier || 'N/A',
        currentStock: p.quantity,
        price: p.price,
        stockValue: Math.round(p.quantity * p.price * 100) / 100,
        status: p.quantity === 0 ? 'Out of Stock' : p.quantity < 20 ? 'Low Stock' : 'In Stock',
      }));

      return res.json({
        reportType: 'Inventory Status',
        columns: ['Product Name', 'SKU', 'Category', 'Supplier', 'Current Stock', 'Price', 'Stock Value', 'Status'],
        rows,
      });
    }

    if (reportType === 'Profit Report') {
      // Profit Report - monthly breakdown
      const orders = await Order.find({ ...filter, status: { $ne: 'Cancelled' } }).populate('products.product');

      const monthlyData = {};
      orders.forEach(order => {
        const d = new Date(order.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[key]) monthlyData[key] = { revenue: 0, cost: 0 };
        monthlyData[key].revenue += order.totalAmount;
        order.products.forEach(item => {
          if (item.product) {
            monthlyData[key].cost += item.price * item.quantity * 0.6;
          }
        });
      });

      const rows = Object.entries(monthlyData)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, data]) => ({
          month,
          totalRevenue: Math.round(data.revenue * 100) / 100,
          totalCost: Math.round(data.cost * 100) / 100,
          grossProfit: Math.round((data.revenue - data.cost) * 100) / 100,
          margin: data.revenue === 0 ? '0.00' : ((((data.revenue - data.cost) / data.revenue) * 100).toFixed(2)),
          orderCount: orders.filter(o => {
            const od = new Date(o.createdAt);
            return `${od.getFullYear()}-${String(od.getMonth() + 1).padStart(2, '0')}` === month;
          }).length,
        }));

      return res.json({
        reportType: 'Profit Report',
        columns: ['Month', 'Total Revenue', 'Total Cost', 'Gross Profit', 'Margin %', 'Orders'],
        rows,
      });
    }

    // Default: Item Sales Report — aggregated per product (one row per sold product)
    const orders = await Order.find({ ...filter, status: { $ne: 'Cancelled' } })
      .populate('products.product');

    // Group by productId so each product appears only once
    const productMap = {};
    orders.forEach(order => {
      order.products.forEach(item => {
        if (!item.product) return;
        const pid = item.product._id.toString();
        if (!productMap[pid]) {
          productMap[pid] = {
            itemName: item.product.name,
            stockCode: item.product.sku,
            category: item.product.category || 'N/A',
            supplier: item.product.supplier || 'N/A',
            stockLevel: item.product.quantity,
            price: item.price,
            qtySold: 0,
            totalRevenue: 0,
            totalCost: 0,
          };
        }
        const lineRevenue = item.price * item.quantity;
        const lineCost = lineRevenue * 0.6;
        productMap[pid].qtySold += item.quantity;
        productMap[pid].totalRevenue += lineRevenue;
        productMap[pid].totalCost += lineCost;
        // Keep the latest unit price in case it changed across orders
        productMap[pid].price = item.price;
        // Keep fresh stock level
        productMap[pid].stockLevel = item.product.quantity;
      });
    });

    const rows = Object.values(productMap)
      .filter(p => p.qtySold > 0)          // only products that were actually sold
      .sort((a, b) => b.qtySold - a.qtySold) // sort by most sold first
      .map(p => {
        const profit = p.totalRevenue - p.totalCost;
        const margin = p.totalRevenue === 0 ? 0 : ((profit / p.totalRevenue) * 100);
        return {
          itemName: p.itemName,
          stockCode: p.stockCode,
          qtySold: p.qtySold,
          category: p.category,
          supplier: p.supplier,
          stockLevel: p.stockLevel,
          price: Math.round(p.price * 100) / 100,
          cost: Math.round(p.totalCost * 100) / 100,
          profit: Math.round(profit * 100) / 100,
          margin: margin.toFixed(2),
        };
      });

    res.json({
      reportType: 'Item Sales',
      columns: ['Item Name', 'Stock Code', '# Sold', 'Category', 'Supplier', 'Stock Level', 'Price', 'Cost', 'Profit', 'Margin'],
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get Dashboard Analytics (Charts + Table data)
// @route   GET /api/auth/dashboard/analytics
// @access  Private
router.get('/dashboard/analytics', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'SuperAdmin' ? {} : { shopId: req.user._id };
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // --- Helper: map JS getDay() (0=Sun) to Mon-based index ---
    const toDayIndex = (date) => ((new Date(date).getDay() + 6) % 7);

    // --- Date boundaries for current & previous week ---
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    currentWeekStart.setHours(0, 0, 0, 0);

    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    // --- 1. Sales Data (Current Week vs Previous Week) ---
    const currentWeekOrders = await Order.find({
      ...filter,
      createdAt: { $gte: currentWeekStart }
    });

    const previousWeekOrders = await Order.find({
      ...filter,
      createdAt: { $gte: previousWeekStart, $lt: currentWeekStart }
    });

    const aggregateByDay = (orders) => {
      const daily = [0, 0, 0, 0, 0, 0, 0];
      orders.forEach(order => {
        daily[toDayIndex(order.createdAt)] += order.totalAmount;
      });
      return daily;
    };

    const salesData = {
      categories: dayLabels,
      series: [
        { name: 'Current Week', data: aggregateByDay(currentWeekOrders) },
        { name: 'Previous Week', data: aggregateByDay(previousWeekOrders) }
      ],
      currentWeekTotal: currentWeekOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      previousWeekTotal: previousWeekOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    };

    // --- 2. Sales By City (from customer address) ---
    const allOrders = await Order.find(filter).populate('customer');
    const cityMap = {};
    allOrders.forEach(order => {
      if (order.customer) {
        const city = order.customer.address || 'Unknown';
        cityMap[city] = (cityMap[city] || 0) + order.totalAmount;
      }
    });

    const cityData = {
      labels: Object.keys(cityMap).length > 0 ? Object.keys(cityMap) : ['No Data'],
      series: Object.values(cityMap).length > 0 ? Object.values(cityMap) : [0]
    };

    // --- 3. Channel Data (grouped by product category per day) ---
    const ordersWithProducts = await Order.find(filter).populate('products.product');
    const categoryDayMap = {};

    ordersWithProducts.forEach(order => {
      const dayIdx = toDayIndex(order.createdAt);
      order.products.forEach(item => {
        if (item.product) {
          const cat = item.product.category || 'Uncategorized';
          if (!categoryDayMap[cat]) {
            categoryDayMap[cat] = [0, 0, 0, 0, 0, 0, 0];
          }
          categoryDayMap[cat][dayIdx] += item.quantity;
        }
      });
    });

    const channelSeries = Object.entries(categoryDayMap).map(([name, data]) => ({ name, data }));
    const channelData = {
      categories: dayLabels,
      series: channelSeries.length > 0 ? channelSeries : [{ name: 'No Data', data: [0, 0, 0, 0, 0, 0, 0] }]
    };

    // --- 4. Top Selling Products ---
    const productSalesMap = {};
    ordersWithProducts.forEach(order => {
      order.products.forEach(item => {
        if (item.product) {
          const pid = item.product._id.toString();
          if (!productSalesMap[pid]) {
            productSalesMap[pid] = {
              name: item.product.name,
              price: item.product.price,
              quantity: 0,
              amount: 0
            };
          }
          productSalesMap[pid].quantity += item.quantity;
          productSalesMap[pid].amount += item.quantity * item.price;
        }
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    res.json({ salesData, cityData, channelData, topProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get Shop Owner Dashboard Stats
// @route   GET /api/auth/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'SuperAdmin' ? {} : { shopId: req.user._id };
    
    const productCount = await Product.countDocuments(filter);
    const orderCount = await Order.countDocuments(filter);
    const customerCount = await Customer.countDocuments(filter);
    
    // Quick status calculation for orders (fake real-time metrics config)
    const pendingOrders = await Order.countDocuments({ ...filter, status: 'Pending' });
    const shippedOrders = await Order.countDocuments({ ...filter, status: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ ...filter, status: 'Delivered' });

    // Calculate today's invoices
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysInvoices = await Order.countDocuments({
      ...filter,
      createdAt: { $gte: today }
    });

    // Calculate low stock items (quantity < 20)
    const lowStockItems = await Product.countDocuments({
      ...filter,
      quantity: { $lt: 20 }
    });

    res.json({
      productCount,
      orderCount,
      customerCount,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      todaysInvoices,
      lowStockItems
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
