import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Divider } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Subscriptions() {
  const [counts, setCounts] = useState({ basicUsers: 0, premiumUsers: 0, enterpriseUsers: 0 });
  const [recentShops, setRecentShops] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://smart-inventory-management-system-backend.onrender.com/api/superadmin/subscriptions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCounts(await res.json());
        }

        const shopsRes = await fetch("https://smart-inventory-management-system-backend.onrender.com/api/superadmin/shops", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (shopsRes.ok) {
          const shopsData = await shopsRes.json();
          // Take the top 3 most recent active shops to act as "transactions"
          setRecentShops(shopsData.filter(s => s.status !== 'Suspended').slice(0, 3));
        }

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const plans = [
    {
      name: "Basic Plan",
      price: "$20/m",
      users: `${counts.basicUsers} Active Shops`,
      color: "#3b82f6",
      features: ["Unlimited Inventory Tracking", "Basic Analytics & Reporting", "1 Store Location", "Email Support"]
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: "100%", bgcolor: "#f9fafb" }}>
      <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
        Subscription Management
      </Typography>

      <Grid container spacing={3} mb={4}>
        {plans.map((plan, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ height: '4px', width: '100%', bgcolor: plan.color, position: 'absolute', top: 0, left: 0 }} />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={1}>{plan.name}</Typography>
                <Typography variant="h4" fontWeight="900" color="text.primary" mb={1}>{plan.price}</Typography>
                <Box display="flex" alignItems="center" gap={1} color="text.secondary" mb={2}>
                  <CheckCircleIcon fontSize="small" sx={{ color: plan.color }} />
                  <Typography variant="body2">{plan.users}</Typography>
                </Box>
                <Box mb={3}>
                  {plan.features.map((feature, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                      <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button variant="outlined" fullWidth sx={{ textTransform: 'none', borderRadius: 2, color: plan.color, borderColor: plan.color }}>
                  Manage Plan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0' }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Recent Transactions</Typography>
        <Divider mb={2} />
        {recentShops.length > 0 ? recentShops.map((shop, i) => (
          <Box key={i} display="flex" justifyContent="space-between" p={2} borderBottom="1px solid #f0f0f0">
            <Typography variant="body2" fontWeight="bold">{shop.name}</Typography>
            <Typography variant="body2" color="text.secondary">Subscribed to {shop.plan}</Typography>
            <Typography variant="body2" fontWeight="bold" color="success.main">+{shop.mrr}.00</Typography>
          </Box>
        )) : (
          <Typography variant="body2" color="text.secondary" p={2}>No recent transactions found.</Typography>
        )}
        <Button sx={{ mt: 2, textTransform: 'none' }}>View All Transactions</Button>
      </Paper>
    </Box>
  );
}