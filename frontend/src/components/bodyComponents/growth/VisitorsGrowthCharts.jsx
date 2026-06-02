import React from "react";
import ApexCharts from "react-apexcharts";
import { Box, Typography } from "@mui/material";

export default function VisitorsGrowthCharts({ chartData }) {
  // ─── Fallback: no data available ───
  if (!chartData || !chartData.series || chartData.series.length === 0) {
    return (
      <Box sx={{ marginX: 4, bgcolor: "white", borderRadius: 2, padding: 3, height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography color="textSecondary">No visitor data available</Typography>
      </Box>
    );
  }

  const options3 = {
    colors: ["#A020F0", "#FA6800"],
    chart: {
      id: "basic-bar",
      type: "bar",
      stacked: false, //one on top of another
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      offsetY: 0,
    },
    title: {
      text: "Visitors",
    },
    plotOptions: {
      bar: {
        columnWidth: "15%",
        horizontal: false,
        borderRadius: 2,
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
        options={options3}
        series={chartData.series}
        type="bar"
        width="100%"
        height={300}
      />
    </Box>
  );
}
