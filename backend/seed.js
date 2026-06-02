const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_management';

const productList = [
  { id: 1, name: "Cap", category: "Hats", price: 828, stock: 25 },
  { id: 2, name: "2 Color T-Shirt", category: "Hats", price: 144, stock: 43 },
  { id: 3, name: "Polo Tshirt", category: "Men's cloths", price: 28, stock: 123 },
  { id: 4, name: "Couple Set", category: "Men's cloths", price: 85, stock: 33 },
  { id: 5, name: "Collection", category: "Collection", price: 113, stock: 11 },
  { id: 6, name: "Balt Bag", category: "Collection", price: 28, stock: 123 },
  { id: 20, name: "Female T-Shirt", category: "Women's cloths", price: 25, stock: 10 },
  { id: 7, name: "Female Polo T-Shirt", category: "Women's cloths", price: 92, stock: 323 },
  { id: 8, name: "Half Pant", category: "Women's cloths", price: 35, stock: 52 },
  { id: 9, name: "Bag", category: "Accessories", price: 13, stock: 25 },
  { id: 10, name: "Glasses", category: "Glases", price: 828, stock: 30 },
  { id: 11, name: "Nike Hat", category: "Hats", price: 144, stock: 20 },
  { id: 12, name: "Addidas Shoes", category: "Shoes", price: 28, stock: 19 },
  { id: 13, name: "Luis glasses", category: "Glasses", price: 85, stock: 30 },
  { id: 14, name: "kids T-Shirt", category: "T-Shirts", price: 113, stock: 75 },
  { id: 15, name: "Sandals", category: "Shoes", price: 28, stock: 12 },
  { id: 16, name: "Gucci Bag", category: "Accessories", price: 25, stock: 13 },
  { id: 17, name: "Sport Shoes", category: "Shoes", price: 92, stock: 18 },
  { id: 18, name: "Nasa T-Shirt", category: "T-Shirts", price: 35, stock: 27 },
  { id: 19, name: "American Pants", category: "Pants", price: 13, stock: 43 },
];

const customerInfo = {
  firstName: "ADMI",
  lastName: "ZAKARYAE",
  position: "Software Engineer",
  mobile: "+212 6 51 88 61 51",
};

const ordersDataParams = [
  // each contains arrays of indices into productList
  [0, 1, 2],
  [1, 1, 2],
  [2, 1, 2],
  [3, 1, 2],
  [4, 1, 2],
  [5, 1, 2],
  [6, 1, 2],
  [7, 1, 2],
  [8, 1, 2],
  [9, 1, 2],
  [10, 1, 2],
  [11, 1, 2],
  [12, 1, 2],
  [0, 1, 2],
  [12, 1, 2],
  [3, 1, 2],
  [5, 1, 2],
  [6, 1, 2],
  [8, 1, 2],
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});

    console.log("Cleared existing data.");

    // Insert Products
    const createdProducts = [];
    for (let i = 0; i < productList.length; i++) {
      const p = productList[i];
      const newProduct = await Product.create({
        name: p.name,
        category: p.category,
        price: p.price,
        quantity: p.stock,
        // Using id from old frontend to ensure uniqueness
        sku: "SKU-" + p.id, 
      });
      createdProducts.push(newProduct);
    }
    console.log(`Inserted ${createdProducts.length} products.`);

    // Insert Customer
    const createdCustomer = await Customer.create({
      name: `${customerInfo.firstName} ${customerInfo.lastName}`,
      email: "admi.zakaryae@example.com", // Schema demands an email, creating dummy
      phone: customerInfo.mobile,
      address: "Unknown",
    });

    const customersArray = [];
    // The Customers.js exported an array of 20 customers with the exact same data. 
    // We can insert 20 of them just to match and have exact data, or just 1.
    // Customers.js actually showed 20 identical customers for some reason. Let's make 20 customers with a slightly unique email.
    for (let i = 1; i <= 20; i++) {
        const c = await Customer.create({
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: `admi.zakaryae${i}@example.com`,
            phone: customerInfo.mobile,
        });
        customersArray.push(c);
    }
    console.log(`Inserted ${customersArray.length} customers.`);


    // Insert Orders
    const createdOrders = [];
    for (let i = 0; i < ordersDataParams.length; i++) {
      const orderProdIndices = ordersDataParams[i];
      const productsForOrder = orderProdIndices.map((prodIndex) => {
        const dbProd = createdProducts[prodIndex];
        return {
          product: dbProd._id,
          quantity: 5,
          price: dbProd.price, // capturing point in time price
        };
      });

      // Calculate total
      let totalAmount = 0;
      productsForOrder.forEach((p) => {
        totalAmount += p.quantity * p.price;
      });

      const newOrder = await Order.create({
        customer: customersArray[i % customersArray.length]._id,
        products: productsForOrder,
        totalAmount: totalAmount,
        status: 'Pending'
      });
      createdOrders.push(newOrder);
    }
    console.log(`Inserted ${createdOrders.length} orders.`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();
