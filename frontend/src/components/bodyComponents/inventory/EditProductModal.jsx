import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  InputAdornment,
  CircularProgress,
  Box,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

const API_BASE = "https://smart-inventory-management-system-backend.onrender.com/api";

const modernInputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#94a3b8" },
    "&.Mui-focused fieldset": { borderColor: "#1976d2", borderWidth: "2px" },
  },
};

export default function EditProductModal({ open, product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    quantity: "",
    supplier: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Pre-fill form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        price: product.price || "",
        quantity: product.quantity || "",
        supplier: product.supplier || "",
        description: product.description || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const payload = {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      };

      const res = await fetch(`${API_BASE}/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Error ${res.status}`);
      }

      const updatedProduct = await res.json();
      setSnackbar({ open: true, message: "Product updated successfully!", severity: "success" });
      onSuccess(updatedProduct); // bubble up to parent for immediate list refresh
      onClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Failed to update product", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* Title Bar */}
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="700">
              Edit Product
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Update details for: <strong>{product?.name}</strong>
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: "#f8fafc" }}>
          <form id="edit-product-form" onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              {/* Product Name */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={0.8}>
                  Product Name *
                </Typography>
                <TextField
                  name="name"
                  fullWidth
                  required
                  placeholder="e.g. Apple iPhone 15 Pro"
                  value={formData.name}
                  onChange={handleChange}
                  sx={modernInputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Inventory2OutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Category & SKU */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={0.8}>
                  Category *
                </Typography>
                <TextField
                  name="category"
                  fullWidth
                  required
                  placeholder="e.g. Electronics"
                  value={formData.category}
                  onChange={handleChange}
                  sx={modernInputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={0.8}>
                  SKU (Barcode) *
                </Typography>
                <TextField
                  name="sku"
                  fullWidth
                  required
                  placeholder="e.g. IPH-15-PRO-128"
                  value={formData.sku}
                  onChange={handleChange}
                  sx={modernInputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeScannerOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Price & Quantity */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={0.8}>
                  Selling Price ($) *
                </Typography>
                <TextField
                  name="price"
                  type="number"
                  fullWidth
                  required
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  sx={modernInputStyle}
                  inputProps={{ min: 0, step: "0.01" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyOutlinedIcon sx={{ color: "#10b981" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={0.8}>
                  Stock Quantity *
                </Typography>
                <TextField
                  name="quantity"
                  type="number"
                  fullWidth
                  required
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  sx={modernInputStyle}
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LayersOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Supplier */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={0.8}>
                  Supplier
                </Typography>
                <TextField
                  name="supplier"
                  fullWidth
                  placeholder="e.g. Apple Inc."
                  value={formData.supplier}
                  onChange={handleChange}
                  sx={modernInputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalShippingOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="600" color="#475569" mb={0.8}>
                  Description
                </Typography>
                <TextField
                  name="description"
                  fullWidth
                  placeholder="Short product description..."
                  value={formData.description}
                  onChange={handleChange}
                  sx={modernInputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f8fafc", gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "600",
              px: 3,
              borderColor: "#cbd5e1",
              color: "#64748b",
              "&:hover": { bgcolor: "#f1f5f9", borderColor: "#94a3b8" },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-product-form"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "700",
              px: 4,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              boxShadow: "0 4px 14px rgba(25,118,210,0.35)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                boxShadow: "0 6px 20px rgba(25,118,210,0.45)",
              },
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success / Error snackbar */}
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
          sx={{ borderRadius: "10px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
