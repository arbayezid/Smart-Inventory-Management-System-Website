import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

// Generate a consistent color from a product name string
const stringToColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
};

export default function Product({ productName }) {
  const firstLetter = productName ? productName.charAt(0).toUpperCase() : "?";
  const bgColor = stringToColor(productName);

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Avatar
        alt={productName}
        sx={{
          width: 32,
          height: 32,
          bgcolor: bgColor,
          fontSize: "0.85rem",
          fontWeight: 700,
        }}
      >
        {firstLetter}
      </Avatar>
      <Typography variant="subtitle2" fontWeight={600} color="#1e293b">
        {productName}
      </Typography>
    </Box>
  );
}
