import { Box, Typography } from "@mui/material";
import React from "react";
import ApexCharts from "react-apexcharts";

export default function SalesGrowthCharts({ chartData }) {
  // ─── Fallback: no data available ───
  if (!chartData || !chartData.series || chartData.series.length === 0) {
    return (
      <Box sx={{ marginX: 4, bgcolor: "white", borderRadius: 2, padding: 3, height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography color="textSecondary">No sales growth data available</Typography>
      </Box>
    );
  }

  const options = {
    chart: {
      id: "basic-bar",
      type: "bar",
      stacked: true, //one on top of another
    },
    dataLabels: {
      enabled: true,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: 0,
    },
    title: {
      text: "Sales Growth Over The Year",
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        horizontal: false,
      },
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: chartData.categories,
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
        offsetY: 30,
        offsetX: 60,
      },
    },
  };

  return (
    <Box
      sx={{
        marginX: 4,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "100%",
      }}
    >
      <ApexCharts
        options={options}
        series={chartData.series}
        height={300}
        type="bar"
        width="100%"
      />
    </Box>
  );
}
