import React from "react";
import { Box, Typography } from "@mui/material";
import ApexCharts from "react-apexcharts";

export default function SalesByCity({ cityData }) {
  // ─── Fallback: no data available ───
  if (
    !cityData ||
    !cityData.labels ||
    cityData.labels.length === 0 ||
    (cityData.labels.length === 1 && cityData.labels[0] === "No Data")
  ) {
    return (
      <Box
        sx={{
          margin: 3,
          bgcolor: "white",
          borderRadius: 2,
          padding: 3,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No city sales data available
        </Typography>
      </Box>
    );
  }

  const { labels, series } = cityData;

  // Compute percentage legend items dynamically
  const total = series.reduce((sum, val) => sum + val, 0);
  const customLegendItems = labels.map((label, i) => {
    const pct = total > 0 ? ((series[i] / total) * 100).toFixed(1) : "0.0";
    return `${label} <b>${pct}%</b>`;
  });

  const donutOption = {
    labels: labels,
    legend: {
      position: "right",
      fontSize: "14",
      customLegendItems: customLegendItems,
    },
    title: {
      text: "Sales By City",
    },
  };

  return (
    <Box
      sx={{
        margin: 3,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "100%",
      }}
    >
      <ApexCharts
        options={donutOption}
        series={series}
        type="pie"
        width="100%"
      />
    </Box>
  );
}
