import React, { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Typography } from "@mui/material";
import RevenueCard from "../revenue/RevenueCard";
import VisitorsGrowthCharts from "./VisitorsGrowthCharts";
import ProductsGrowthCharts from "./ProductsGrowthCharts";
import CustomersGrowthCharts from "./CustomersGrowthCharts";
import SalesGrowthCharts from "./SalesGrowthCharts";
import { getGrowthData } from "../../../services/dashboardApi";

export default function Growth() {
  const [growthCards, setGrowthCards] = useState([]);
  const [salesGrowthChart, setSalesGrowthChart] = useState(null);
  const [productGrowthChart, setProductGrowthChart] = useState(null);
  const [customerGrowthChart, setCustomerGrowthChart] = useState(null);
  const [visitorsChart, setVisitorsChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGrowthData();
        if (!cancelled) {
          setGrowthCards(data.growthCards || []);
          setSalesGrowthChart(data.salesGrowthChart || null);
          setProductGrowthChart(data.productGrowthChart || null);
          setCustomerGrowthChart(data.customerGrowthChart || null);
          setVisitorsChart(data.visitorsChart || null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mx: 3 }}>
      <Grid container sx={{ mx: 4 }}>
        {growthCards.map((card, index) => (
          <Grid item md={3} key={index}>
            <Box m={4}>
              <RevenueCard card={card} />
            </Box>
          </Grid>
        ))}
      </Grid>
      <Grid container sx={{ mx: 4 }}>
        <Grid item md={6}>
          <SalesGrowthCharts chartData={salesGrowthChart} />
        </Grid>
        <Grid item md={6}>
          <VisitorsGrowthCharts chartData={visitorsChart} />
        </Grid>
      </Grid>
      <Grid container sx={{ mx: 4 }}>
        <Grid item md={6}>
          <ProductsGrowthCharts chartData={productGrowthChart} />
        </Grid>
        <Grid item md={6}>
          <CustomersGrowthCharts chartData={customerGrowthChart} />
        </Grid>
      </Grid>
    </Box>
  );
}
