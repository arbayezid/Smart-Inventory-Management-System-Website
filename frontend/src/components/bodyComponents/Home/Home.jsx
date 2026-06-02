import React, { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Typography } from "@mui/material";

import UilBox from "@iconscout/react-unicons/icons/uil-box";
import UilInvoice from "@iconscout/react-unicons/icons/uil-invoice";
import UilExclamationTriangle from "@iconscout/react-unicons/icons/uil-exclamation-triangle";
// Total orders এর জন্য নতুন আইকন
import UilShoppingCart from "@iconscout/react-unicons/icons/uil-shopping-cart";

import InfoCard from "../../subComponents/InfoCard";
import TotalSales from "./TotalSales";
import SalesByCity from "./SalesByCity";
import Channels from "./Channels";
import TopSellingProduct from "./TopSellingProduct";

import {
  getDashboardStats,
  getDashboardAnalytics,
} from "../../../services/dashboardApi";

export default function Home() {
  // ─── State ──────────────────────────────────────────────
  const [stats, setStats] = useState({
    productCount: 0,
    todaysInvoices: 0,
    lowStockItems: 0,
    orderCount: 0,
  });

  const [salesData, setSalesData] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [topProducts, setTopProducts] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Data Fetching ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [statsRes, analyticsRes] = await Promise.all([
          getDashboardStats(),
          getDashboardAnalytics(),
        ]);

        if (cancelled) return;

        setStats(statsRes);
        setSalesData(analyticsRes.salesData);
        setCityData(analyticsRes.cityData);
        setChannelData(analyticsRes.channelData);
        setTopProducts(analyticsRes.topProducts);
      } catch (err) {
        if (!cancelled) {
          console.error("Dashboard fetch error:", err);
          setError(err.message || "Failed to load dashboard data.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Card Config ────────────────────────────────────────
  const cardComponent = [
    {
      icon: <UilBox size={60} color={"#F6F4EB"} />,
      title: "Products",
      subTitle: stats.productCount || "0",
      mx: 3,
      my: 0,
    },
    {
      icon: <UilInvoice size={60} color={"#F6F4EB"} />,
      title: "Today's Invoices",
      subTitle: stats.todaysInvoices || "0",
      mx: 5,
      my: 0,
    },
    {
      icon: <UilExclamationTriangle size={60} color={"#F6F4EB"} />,
      title: "Low Stock Items",
      subTitle: stats.lowStockItems || "0",
      mx: 5,
      my: 0,
    },
    {
      icon: <UilShoppingCart size={60} color={"#F6F4EB"} />, // Changed icon here
      title: "Total Orders",
      subTitle: stats.orderCount || "0",
      mx: 3,
      my: 0,
    },
  ];

  // ─── Loading State ──────────────────────────────────────
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Loading dashboard…
        </Typography>
      </Box>
    );
  }

  // ─── Error State ────────────────────────────────────────
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          Failed to load dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <Box
      sx={{
        margin: 0,
        padding: 3,
      }}
    >
      <Grid
        container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginX: 3,
          borderRadius: 2,
          padding: 0,
        }}
      >
        {cardComponent.map((card, index) => (
          <Grid item md={3} key={index}>
            <InfoCard card={card} />
          </Grid>
        ))}
      </Grid>

      <Grid container sx={{ marginX: 3 }}>
        <Grid item md={8}>
          <TotalSales salesData={salesData} />
        </Grid>
        <Grid item md={4}>
          <SalesByCity cityData={cityData} />
        </Grid>
      </Grid>

      <Grid container sx={{ margin: 3 }}>
        <Grid item md={6}>
          <Channels channelData={channelData} />
        </Grid>
        <Grid item md={6}>
          <TopSellingProduct products={topProducts} />
        </Grid>
      </Grid>
    </Box>
  );
}