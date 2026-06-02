import React from "react";
import ApexCharts from "react-apexcharts";
import { Box, Typography } from "@mui/material";

export default function BestSelledProductChartBar({ chartData }) {
  // ─── Fallback: no data available ───
  if (!chartData || !chartData.series || chartData.series.length === 0) {
    return (
      <Box sx={{ marginX: 4, bgcolor: "white", borderRadius: 2, padding: 3, height: "95%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography color="textSecondary">No product data available</Typography>
      </Box>
    );
  }

  const options3 = {
    colors: ["#5A4FCF", "#FFA500", "#C53500", "#FFBF00", "#FF3659"],
    chart: {
      id: "basic-bar",
      type: "bar",
      stacked: true, //one on top of another
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
      text: "Top 5 Selled Product Over Year",
    },
    plotOptions: {
      bar: {
        distributed: true,
        barHeight: "40%",
        horizontal: true,
      },
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
        type="bar"
        width="100%"
        height="320"
      />
    </Box>
  );
}
