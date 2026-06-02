import React, { useState, useEffect } from "react";
import RevenueCard from "./RevenueCard";
import { Box, Grid, CircularProgress, Typography } from "@mui/material";
import RevenueCostChart from "./RevenueCostChart";
import BestSelledProductChart from "./BestSelledProductChart";
import BestSelledProductChartBar from "./BestSelledProductChartBar";
import { getRevenueData } from "../../../services/dashboardApi";

export default function Revenue() {
  const [revenueCards, setRevenueCards] = useState([]);
  const [revenueCostChart, setRevenueCostChart] = useState(null);
  const [bestSellingWeekly, setBestSellingWeekly] = useState(null);
  const [bestSellingYearly, setBestSellingYearly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRevenueData();
        if (!cancelled) {
          setRevenueCards(data.revenueCards || []);
          setRevenueCostChart(data.revenueCostChart || null);
          setBestSellingWeekly(data.bestSellingWeekly || null);
          setBestSellingYearly(data.bestSellingYearly || null);
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
        {revenueCards.map((card, index) => (
          <Grid item md={3} key={index}>
            <Box m={4}>
              <RevenueCard card={card} />
            </Box>
          </Grid>
        ))}
      </Grid>
      <Grid container sx={{ mx: 4 }}>
        <Grid item md={12}>
          <RevenueCostChart chartData={revenueCostChart} />
        </Grid>
      </Grid>
      <Grid container sx={{ mx: 4 }}>
        <Grid item md={6}>
          <BestSelledProductChart chartData={bestSellingWeekly} />
        </Grid>
        <Grid item md={6}>
          <BestSelledProductChartBar chartData={bestSellingYearly} />
        </Grid>
      </Grid>
    </Box>
  );
}
