import { Box, Typography } from "@mui/material";
import React from "react";
import ApexCharts from "react-apexcharts";

export default function TotalSales({ salesData }) {
  // ─── Fallback: no data available ───
  if (!salesData || !salesData.series || salesData.series.length === 0) {
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
          No sales data available
        </Typography>
      </Box>
    );
  }

  const { categories, series, currentWeekTotal, previousWeekTotal } = salesData;

  const formatCurrency = (val) =>
    `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const options = {
    title: {
      text: "Total Sales",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
    },
    subtitle: {
      text: "Sales over time",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    legend: {
      customLegendItems: [
        `Current Week  <b>${formatCurrency(currentWeekTotal)}</b>`,
        `Previous Week <b>${formatCurrency(previousWeekTotal)}</b>`,
      ],
      position: "top",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Helvetica, Arial",
      offsetY: -20,
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 9,
      },
    },
    theme: {
      mode: "light",
    },
    chart: {
      height: 328,
      type: "line",
      zoom: {
        enabled: true,
      },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 2,
        blur: 4,
        opacity: 0.2,
      },
    },
    xaxis: {
      categories: categories,
    },
  };

  const chartSeries = series.map((s) => ({
    type: "line",
    name: s.name,
    data: s.data,
  }));

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
        options={options}
        series={chartSeries}
        height={300}
        type="line"
        width="100%"
      />
    </Box>
  );
}
