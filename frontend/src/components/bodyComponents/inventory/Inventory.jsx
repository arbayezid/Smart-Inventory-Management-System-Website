import { Grid, Box, Typography, Paper } from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import Products from "./Products";
import Overview from "./Overview";

const API_BASE = "https://smart-inventory-management-system-backend.onrender.com/api";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    todaySell: 0,
    yesterdaySell: 0,
    totalSell: 0,
    productReserved: 0,
    stockIssues: 0,
  });

  // ─── Core data fetcher ──────────────────────────────────────
  const fetchInventoryData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/products`, { headers }),
        fetch(`${API_BASE}/orders`, { headers }),
      ]);

      if (!productsRes.ok || !ordersRes.ok) {
        throw new Error("Failed to fetch inventory data");
      }

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      const formattedProducts = productsData.map((item) => ({
        ...item,
        id: item._id,
      }));
      setProducts(formattedProducts);

      // Compute statistics from orders
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);

      let todaySell = 0;
      let yesterdaySell = 0;
      let totalSell = 0;
      let productReserved = 0;

      ordersData.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        totalSell += order.totalAmount;

        if (orderDate >= startOfToday) {
          todaySell += order.totalAmount;
        } else if (orderDate >= startOfYesterday && orderDate < startOfToday) {
          yesterdaySell += order.totalAmount;
        }

        if (order.status === "Pending" || order.status === "Processing") {
          order.products.forEach((p) => {
            productReserved += p.quantity;
          });
        }
      });

      const stockIssues = productsData.filter((p) => p.quantity < 20).length;

      setStats({
        totalProducts: productsData.length,
        todaySell,
        yesterdaySell,
        totalSell,
        productReserved,
        stockIssues,
      });
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  }, []);

  // ─── Polling (real-time) ─────────────────────────────────────
  useEffect(() => {
    fetchInventoryData();
    const intervalId = setInterval(fetchInventoryData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchInventoryData]);

  // ─── Optimistic Update: Product Edited ───────────────────────
  // Immediately update the product in local state (no waiting for next poll)
  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === updatedProduct._id
          ? { ...updatedProduct, id: updatedProduct._id }
          : p
      )
    );
    // Also recompute stock issues count
    setStats((prev) => ({
      ...prev,
      stockIssues: products
        .map((p) =>
          p._id === updatedProduct._id ? updatedProduct : p
        )
        .filter((p) => p.quantity < 20).length,
    }));
  };

  // ─── Optimistic Update: Product Deleted ──────────────────────
  // Immediately remove the product from local state
  const handleProductDeleted = (deletedId) => {
    setProducts((prev) => {
      const remaining = prev.filter((p) => p._id !== deletedId);
      // Recompute stats inline
      setStats((s) => ({
        ...s,
        totalProducts: remaining.length,
        stockIssues: remaining.filter((p) => p.quantity < 20).length,
      }));
      return remaining;
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pt: 2, pb: 4 }}>
      <Grid container spacing={3} sx={{ px: 4 }}>
        {/* Products Table (left) */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: "white",
              borderRadius: 4,
              padding: 3,
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            }}
          >
            <Products
              products={products}
              onProductUpdated={handleProductUpdated}
              onProductDeleted={handleProductDeleted}
            />
          </Paper>
        </Grid>

        {/* Overview Panel (right) */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: "white",
              borderRadius: 4,
              padding: 3,
              height: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: "bold",
                borderBottom: "2px solid #eee",
                pb: 1,
              }}
            >
              Overview
            </Typography>
            <Overview stats={stats} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
