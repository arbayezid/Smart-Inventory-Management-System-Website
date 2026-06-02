import React from "react";
import ApexCharts from "react-apexcharts";
import { Box, Typography } from "@mui/material";

export default function Channels({ channelData }) {
  // ─── Fallback: no data available ───
  if (
    !channelData ||
    !channelData.series ||
    channelData.series.length === 0 ||
    (channelData.series.length === 1 && channelData.series[0].name === "No Data")
  ) {
    return (
      <Box
        sx={{
          margin: 3,
          bgcolor: "white",
          borderRadius: 2,
          padding: 3,
          height: "95%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No channel data available
        </Typography>
      </Box>
    );
  }

  const { categories, series } = channelData;

  const options3 = {
    chart: {
      id: "basic-bar",
      type: "bar",
      stacked: true,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
      offsetY: 0,
    },
    title: {
      text: "Channels",
    },
    plotOptions: {
      bar: {
        columnWidth: "10%",
        horizontal: false,
      },
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: categories,
    },
  };

  return (
    <Box
      sx={{
        margin: 3,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "95%",
      }}
    >
      <ApexCharts
        options={options3}
        series={series}
        type="bar"
        width="100%"
        height="320"
      />
    </Box>
  );
}
