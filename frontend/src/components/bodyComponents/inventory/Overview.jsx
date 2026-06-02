import { Box, Card, CardContent, Grid, Typography, Avatar } from "@mui/material";
import React from "react";
import InventoryIcon from "@mui/icons-material/Inventory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import WarningIcon from "@mui/icons-material/Warning";

export default function Overview({ stats }) {
  const defaultStats = stats || {
    totalProducts: 0,
    todaySell: 0,
    yesterdaySell: 0,
    totalSell: 0,
    productReserved: 0,
    stockIssues: 0,
  };

  const statCards = [
    {
      title: "Total Products",
      value: defaultStats.totalProducts,
      icon: <InventoryIcon />,
      color: "#3f51b5",
      bgColor: "#e8eaf6",
    },
    {
      title: "Today's Sell",
      value: `$${defaultStats.todaySell.toFixed(2)}`,
      icon: <TrendingUpIcon />,
      color: "#4caf50",
      bgColor: "#e8f5e9",
    },
    {
      title: "Yesterday's Sell",
      value: `$${defaultStats.yesterdaySell.toFixed(2)}`,
      icon: <TrendingDownIcon />,
      color: "#ff9800",
      bgColor: "#fff3e0",
    },
    {
      title: "Total Sell",
      value: `$${defaultStats.totalSell.toFixed(2)}`,
      icon: <AttachMoneyIcon />,
      color: "#9c27b0",
      bgColor: "#f3e5f5",
    },
    // {

    //   title: "Product Reserved",
    //   value: defaultStats.productReserved,
    //   icon: <EventAvailableIcon />,
    //   color: "#00bcd4",
    //   bgColor: "#e0f7fa",
    // },
    {
      title: "Stock Issues",
      value: defaultStats.stockIssues,
      icon: <WarningIcon />,
      color: "#f44336",
      bgColor: "#ffebee",
    },
  ];

  return (
    <Box>
      <Grid container spacing={2}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={12} key={index}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                borderRadius: 3,
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: stat.bgColor,
                  color: stat.color,
                  width: 48,
                  height: 48,
                  mr: 2,
                }}
              >
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  {stat.title}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {stat.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
