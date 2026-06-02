import React, { useState } from "react";
import {
  Box, Button, TextField, Typography, Paper, Grid, Divider,
  InputAdornment, CircularProgress, Snackbar, Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../../services/dashboardApi";

export default function AddProduct() {
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: "", sku: "", category: "", price: "", quantity: "",
    supplier: "", description: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (e) => {
    setProductData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...productData,
        price: Number(productData.price),
        quantity: Number(productData.quantity),
      };
      await createProduct(payload);
      setSnackbar({ open: true, message: "Product added successfully! Redirecting...", severity: "success" });
      setTimeout(() => navigate("/inventory"), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Failed to add product", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const modernInputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#94a3b8" },
      "&.Mui-focused fieldset": { borderColor: "#1976d2", borderWidth: "2px" },
    },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "900px", mx: "auto" }}>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="800" color="#1e293b">
              Create New Product
            </Typography>
            <Typography variant="body2" color="#64748b" mt={0.5}>
              Fill in the details below to add a new item to your inventory.
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/inventory")}
            variant="outlined"
            disabled={loading}
            sx={{
              borderRadius: "8px", textTransform: "none",
              borderColor: "#cbd5e1", color: "#475569", fontWeight: "600",
              "&:hover": { backgroundColor: "#f8fafc", borderColor: "#94a3b8" },
            }}
          >
            Back to Inventory
          </Button>
        </Box>

        {/* Form Card */}
        <Paper sx={{
          p: { xs: 3, md: 5 }, borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0", backgroundColor: "#ffffff",
        }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>

              {/* Product Name */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={1}>
                  Product Name *
                </Typography>
                <TextField
                  name="name" placeholder="e.g. Apple iPhone 15 Pro"
                  fullWidth required value={productData.name} onChange={handleChange} sx={modernInputStyle}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Inventory2OutlinedIcon sx={{ color: "#94a3b8" }} /></InputAdornment>) }}
                />
              </Grid>

              {/* Category & SKU */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={1}>Category *</Typography>
                <TextField
                  name="category" placeholder="e.g. Electronics"
                  fullWidth required value={productData.category} onChange={handleChange} sx={modernInputStyle}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><CategoryOutlinedIcon sx={{ color: "#94a3b8" }} /></InputAdornment>) }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={1}>SKU (Barcode) *</Typography>
                <TextField
                  name="sku" placeholder="e.g. IPH-15-PRO-128"
                  fullWidth required value={productData.sku} onChange={handleChange} sx={modernInputStyle}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><QrCodeScannerOutlinedIcon sx={{ color: "#94a3b8" }} /></InputAdornment>) }}
                />
              </Grid>

              {/* Price & Quantity */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={1}>Selling Price ($) *</Typography>
                <TextField
                  name="price" type="number" placeholder="0.00"
                  fullWidth required value={productData.price} onChange={handleChange} sx={modernInputStyle}
                  inputProps={{ min: 0, step: "0.01" }}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><AttachMoneyOutlinedIcon sx={{ color: "#10b981" }} /></InputAdornment>) }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={1}>Initial Stock Quantity *</Typography>
                <TextField
                  name="quantity" type="number" placeholder="0"
                  fullWidth required value={productData.quantity} onChange={handleChange} sx={modernInputStyle}
                  inputProps={{ min: 0 }}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><LayersOutlinedIcon sx={{ color: "#94a3b8" }} /></InputAdornment>) }}
                />
              </Grid>

              {/* Supplier & Description (optional) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={1}>
                  Supplier{" "}
                  <Typography component="span" variant="caption" color="#94a3b8">(optional)</Typography>
                </Typography>
                <TextField
                  name="supplier" placeholder="e.g. Samsung Electronics"
                  fullWidth value={productData.supplier} onChange={handleChange} sx={modernInputStyle}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><LocalShippingOutlinedIcon sx={{ color: "#94a3b8" }} /></InputAdornment>) }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={1}>
                  Description{" "}
                  <Typography component="span" variant="caption" color="#94a3b8">(optional)</Typography>
                </Typography>
                <TextField
                  name="description" placeholder="Short product description..."
                  fullWidth value={productData.description} onChange={handleChange} sx={modernInputStyle}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><DescriptionOutlinedIcon sx={{ color: "#94a3b8" }} /></InputAdornment>) }}
                />
              </Grid>

            </Grid>

            <Divider sx={{ my: 4, borderColor: "#e2e8f0" }} />

            {/* Action Buttons */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                onClick={() => navigate("/inventory")} variant="text" disabled={loading}
                sx={{
                  px: 3, py: 1.2, textTransform: "none",
                  color: "#64748b", fontWeight: "600", borderRadius: "8px",
                  "&:hover": { backgroundColor: "#f1f5f9" },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit" variant="contained" disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
                sx={{
                  borderRadius: "8px", px: 4, py: 1.2, textTransform: "none", fontWeight: "700",
                  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                    boxShadow: "0 6px 18px rgba(25,118,210,0.35)",
                  },
                }}
              >
                {loading ? "Saving..." : "Save Product"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Success / Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          icon={snackbar.severity === "success" ? <CheckCircleOutlineIcon /> : undefined}
          sx={{ borderRadius: "10px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}