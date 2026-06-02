import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const API_BASE = "https://smart-inventory-management-system-backend.onrender.com/api";

export default function DeleteConfirmDialog({ open, product, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_BASE}/products/${product._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Error ${res.status}`);
      }

      setSnackbar({ open: true, message: `"${product.name}" deleted successfully.`, severity: "success" });
      onSuccess(product._id); // bubble deleted id up to parent for instant list removal
      onClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Failed to delete product", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
            overflow: "hidden",
          },
        }}
      >
        {/* Red top bar */}
        <Box
          sx={{
            height: 6,
            background: "linear-gradient(90deg, #ef4444, #dc2626)",
          }}
        />

        <DialogContent sx={{ pt: 4, pb: 2, px: 4, textAlign: "center" }}>
          {/* Warning Icon */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "#fff1f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 38, color: "#ef4444" }} />
          </Box>

          <Typography variant="h6" fontWeight="700" color="#1e293b" mb={1}>
            Delete Product?
          </Typography>
          <Typography variant="body2" color="#64748b" lineHeight={1.7}>
            You are about to permanently delete{" "}
            <Box component="span" fontWeight="700" color="#1e293b">
              "{product?.name}"
            </Box>
            . This action{" "}
            <Box component="span" color="#ef4444" fontWeight="700">
              cannot be undone
            </Box>{" "}
            and will remove the product from all inventory records.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 3, pt: 1, gap: 1.5, justifyContent: "center" }}>
          <Button
            onClick={onClose}
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: "600",
              py: 1.2,
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteOutlineIcon />
              )
            }
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: "700",
              py: 1.2,
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
              "&:hover": {
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                boxShadow: "0 6px 20px rgba(239,68,68,0.45)",
              },
            }}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>

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
