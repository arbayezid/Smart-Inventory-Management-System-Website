import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Chart from "react-apexcharts";

export default function RevenueReports() {
  const [revenue, setRevenue] = useState({
    mrr: 0, arr: 0, basicRev: 0, premiumRev: 0, enterpriseRev: 0, churnRate: 1.2, chartData: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://smart-inventory-management-system-backend.onrender.com/api/superadmin/revenue", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setRevenue(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const totalRev = revenue.basicRev + revenue.premiumRev + revenue.enterpriseRev;
  const basicPct = totalRev > 0 ? Math.round((revenue.basicRev / totalRev) * 100) : 0;
  const premiumPct = totalRev > 0 ? Math.round((revenue.premiumRev / totalRev) * 100) : 0;
  const enterprisePct = totalRev > 0 ? Math.round((revenue.enterpriseRev / totalRev) * 100) : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: "100%", bgcolor: "#f9fafb" }}>
      <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
        Financial Overview & Revenue
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #f0f0f0', borderLeft: '4px solid #6366f1' }}>
            <Typography variant="body2" color="text.secondary">Monthly Recurring Revenue (MRR)</Typography>
            <Typography variant="h4" fontWeight="bold" mt={1}>${revenue.mrr.toLocaleString()}</Typography>
            <Typography variant="body2" color="success.main" display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> Current Month
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #f0f0f0', borderLeft: '4px solid #10b981' }}>
            <Typography variant="body2" color="text.secondary">Annual Recurring Revenue (ARR)</Typography>
            <Typography variant="h4" fontWeight="bold" mt={1}>${revenue.arr.toLocaleString()}</Typography>
            <Typography variant="body2" color="success.main" display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> Projected Annual
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #f0f0f0', borderLeft: '4px solid #ef4444' }}>
            <Typography variant="body2" color="text.secondary">Monthly Churn Rate</Typography>
            <Typography variant="h4" fontWeight="bold" mt={1}>{revenue.churnRate}%</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>Healthy status (&lt; 2%)</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Revenue Trend (Last 3 Months)</Typography>
            {revenue.chartData && revenue.chartData.length > 0 ? (
              <Chart
                options={{
                  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
                  xaxis: { categories: revenue.chartData.map(d => d.name) },
                  colors: ['#6366f1'],
                  dataLabels: { enabled: false },
                  plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } }
                }}
                series={[{ name: 'Revenue', data: revenue.chartData.map(d => d.revenue) }]}
                type="bar"
                height={300}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">Loading chart...</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Revenue by Plan Type</Typography>
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" mb={1}><Typography variant="body2">Premium Plan ({premiumPct}%)</Typography><Typography variant="body2" fontWeight="bold">${revenue.premiumRev.toLocaleString()}</Typography></Box>
              <Box sx={{ width: '100%', height: '8px', bgcolor: '#e5e7eb', borderRadius: 5 }}><Box sx={{ width: `${premiumPct}%`, height: '100%', bgcolor: '#6366f1', borderRadius: 5 }} /></Box>
            </Box>
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" mb={1}><Typography variant="body2">Basic Plan ({basicPct}%)</Typography><Typography variant="body2" fontWeight="bold">${revenue.basicRev.toLocaleString()}</Typography></Box>
              <Box sx={{ width: '100%', height: '8px', bgcolor: '#e5e7eb', borderRadius: 5 }}><Box sx={{ width: `${basicPct}%`, height: '100%', bgcolor: '#3b82f6', borderRadius: 5 }} /></Box>
            </Box>
            <Box mb={1}>
              <Box display="flex" justifyContent="space-between" mb={1}><Typography variant="body2">Enterprise Plan ({enterprisePct}%)</Typography><Typography variant="body2" fontWeight="bold">${revenue.enterpriseRev.toLocaleString()}</Typography></Box>
              <Box sx={{ width: '100%', height: '8px', bgcolor: '#e5e7eb', borderRadius: 5 }}><Box sx={{ width: `${enterprisePct}%`, height: '100%', bgcolor: '#10b981', borderRadius: 5 }} /></Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}