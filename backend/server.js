const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes imports moved below
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Content type test
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Inventory Management API' });
});

// Routes
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/superadmin', superAdminRoutes);

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sims:Y8ER5uHBsjK8gWyS@cluster0.qfy9fat.mongodb.net/inventory_management?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // ── Graceful error handling ──────────────────────────────
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌  Port ${PORT} is already in use.`);
        console.error(`   Run this to free it:  npx kill-port ${PORT}\n`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });

    // ── Graceful shutdown on SIGTERM / SIGINT (Ctrl+C) ──────
    const shutdown = (signal) => {
      console.log(`\n${signal} received — closing server gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });
