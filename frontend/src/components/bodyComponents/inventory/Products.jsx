import { Button, Box, Typography, Chip, Tooltip, IconButton } from "@mui/material";
import React, { useState } from "react";
import Product from "./Product";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AddBoxIcon from "@mui/icons-material/AddBox";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditProductModal from "./EditProductModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

export default function Products({ products, onProductUpdated, onProductDeleted }) {
  const navigate = useNavigate();

  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  // ─── Open handlers ──────────────────────────────────────────
  const openEdit = (product) => setEditModal({ open: true, product });
  const openDelete = (product) => setDeleteDialog({ open: true, product });

  // ─── Success callbacks (bubble to Inventory parent) ─────────
  const handleEditSuccess = (updatedProduct) => {
    if (onProductUpdated) onProductUpdated(updatedProduct);
  };

  const handleDeleteSuccess = (deletedId) => {
    if (onProductDeleted) onProductDeleted(deletedId);
  };

  // ─── DataGrid columns ────────────────────────────────────────
  const columns = [
    {
      field: "product",
      headerName: "Product",
      flex: 1.5,
      minWidth: 200,
      renderCell: (cellData) => <Product productName={cellData.row.name} />,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.category || "N/A"}
          size="small"
          variant="outlined"
          sx={{
            color: "text.secondary",
            borderColor: "divider",
            fontWeight: 500,
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      field: "price",
      headerName: "Price",
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => (
        <Typography fontWeight="500" color="text.primary" fontSize="0.9rem">
          ${params.row.price}
        </Typography>
      ),
    },
    {
      field: "quantity",
      headerName: "Stock",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const qty = params.row.quantity;
        const lowStock = qty < 20;
        return (
          <Typography
            sx={{
              color: lowStock ? "error.main" : "success.main",
              fontWeight: "600",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {qty} pcs {lowStock && "(Low)"}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box display="flex" gap={1} alignItems="center" height="100%">
          {/* Edit Button */}
          <Tooltip title="Edit Product" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => openEdit(params.row)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "primary.50",
                },
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip title="Delete Product" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => openDelete(params.row)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "error.main",
                  bgcolor: "error.50",
                },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Inventory2OutlinedIcon sx={{ color: "text.secondary" }} />
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Product List
          </Typography>
          <Chip
            label={`${products?.length || 0} items`}
            size="small"
            variant="outlined"
            sx={{ color: "text.secondary", borderColor: "divider", ml: 1 }}
          />
        </Box>

        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<AddShoppingCartIcon />}
            onClick={() => navigate("/sell-product")}
            sx={{
              borderRadius: "6px",
              textTransform: "none",
              fontWeight: 500,
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            POS / Sell
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddBoxIcon />}
            onClick={() => navigate("/add-product")}
            sx={{
              borderRadius: "6px",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <Box
        sx={{
          width: "100%",
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <DataGrid
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc", // Very subtle gray for header
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              color: "text.secondary",
              fontSize: "0.85rem",
            },
            "& .MuiDataGrid-cell": {
              borderColor: "divider",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f8fafc",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid",
              borderColor: "divider",
            },
          }}
          rows={products || []}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 20, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          autoHeight
        />
      </Box>

      {/* Edit Modal */}
      <EditProductModal
        open={editModal.open}
        product={editModal.product}
        onClose={() => setEditModal({ open: false, product: null })}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        product={deleteDialog.product}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        onSuccess={handleDeleteSuccess}
      />
    </Box>
  );
}