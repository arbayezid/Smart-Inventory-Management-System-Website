import React from "react";
import ApexCharts from "react-apexcharts";
import { Box, Typography } from "@mui/material";

export default function BestSelledProductChart({ chartData }) {
  // ─── Fallback: no data available ───
  if (!chartData || !chartData.series || chartData.series.length === 0) {
    return (
      <Box sx={{ marginX: 4, bgcolor: "white", borderRadius: 2, padding: 3, height: "95%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography color="textSecondary">No product data available</Typography>
      </Box>
    );
  }

  const options3 = {
    chart: {
      id: "basic-bar",
      type: "bar",
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: 0,
    },
    title: {
      text: "Top 5 Selled Product last Week",
    },
    plotOptions: {
      bar: {
        columnWidth: "15%",
        horizontal: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 1,
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 7,
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
        height: "95%",
      }}
    >
      <ApexCharts
        options={options3}
        series={chartData.series}
        type="line"
        width="100%"
        height="320"
      />
    </Box>
  );
}
