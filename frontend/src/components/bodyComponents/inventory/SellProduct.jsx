import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PrintIcon from "@mui/icons-material/Print";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { useNavigate } from "react-router-dom";

export default function SellProduct() {
  const navigate = useNavigate();

  // ==========================================
  // ORIGINAL FUNCTIONALITY STATES
  // ==========================================
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  // NEW STATES FOR CUSTOMER
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Fetch Products
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("https://smart-inventory-management-system-backend.onrender.com/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Add Item to Cart
  const handleAddToCart = () => {
    if (!selectedProduct) return alert("Please select a product first!");
    if (quantity <= 0) return alert("Quantity must be at least 1.");
    if (quantity > selectedProduct.quantity) return alert("Not enough stock available!");

    const existingItemIndex = cart.findIndex((item) => item.id === selectedProduct._id);

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingItemIndex].qty + Number(quantity);

      if (newQty > selectedProduct.quantity) return alert("Total quantity exceeds available stock!");

      updatedCart[existingItemIndex].qty = newQty;
      updatedCart[existingItemIndex].total = newQty * updatedCart[existingItemIndex].price;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          id: selectedProduct._id,
          name: selectedProduct.name,
          price: Number(selectedProduct.price),
          qty: Number(quantity),
          stock: selectedProduct.quantity,
          total: Number(selectedProduct.price) * Number(quantity),
        },
      ]);
    }

    setSelectedProduct(null);
    setQuantity(1);
  };

  // Adjust Quantity Inside Cart (+ / -)
  const adjustCartQuantity = (id, type) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        let newQty = type === "increment" ? item.qty + 1 : item.qty - 1;
        if (newQty > item.stock) {
          alert("Cannot exceed available stock!");
          return item;
        }
        if (newQty < 1) newQty = 1;

        return { ...item, qty: newQty, total: newQty * item.price };
      }
      return item;
    });
    setCart(updatedCart);
  };

  // Remove Item
  const handleRemove = (id) => setCart(cart.filter((item) => item.id !== id));

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = subtotal * (discount / 100);
  const grandTotal = subtotal - discountAmount;

  // Checkout API Call
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("https://smart-inventory-management-system-backend.onrender.com/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: customerName || "Walk-in Customer",
          customerPhone: customerPhone,
          cart: cart,
          totalAmount: grandTotal
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to process checkout");
        } else {
          throw new Error("Server returned an invalid response. Did you restart the backend?");
        }
      }

      alert(`🎉 Sale Completed Successfully for ${customerName || 'Walk-in Customer'}!`);

      // Reset after checkout
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      navigate("/inventory");
    } catch (error) {
      alert(`Error completing sale: ${error.message}`);
      console.error(error);
    }
  };

  // ==========================================
  // MODERN UI STYLING
  // ==========================================
  const modernPaperStyle = {
    p: 3,
    borderRadius: '16px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
    border: '1px solid #f0f2f5',
    backgroundColor: '#ffffff'
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, backgroundColor: '#f4f7fa', minHeight: '100vh' }}>

      {/* Header */}
      <Box display="flex" alignItems="center" mb={3} gap={1.5}>
        <PointOfSaleIcon sx={{ fontSize: 36, color: '#1976d2' }} />
        <Box>
          <Typography variant="h5" fontWeight="800" color="#1e293b">
            Point of Sale (POS)
          </Typography>
          <Typography variant="body2" color="#64748b">
            Process sales and print invoices instantly
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>

        {/* ================= LEFT SIDE: CUSTOMER & PRODUCT ================= */}
        <Grid item xs={12} md={5} lg={4} display="flex" flexDirection="column" gap={3}>

          {/* --- NEW: CUSTOMER INFO CARD --- */}
          <Paper sx={modernPaperStyle}>
            <Typography variant="h6" fontWeight="700" mb={2} color="#0f172a" display="flex" alignItems="center" gap={1}>
              <PersonOutlineOutlinedIcon color="primary" /> Customer Details
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Customer Name"
                variant="outlined"
                fullWidth
                size="small"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                size="small"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Optional"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>

          {/* --- ADD PRODUCT CARD --- */}
          <Paper sx={{ ...modernPaperStyle, flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="700" mb={3} color="#0f172a" display="flex" alignItems="center" gap={1}>
              <ShoppingBagOutlinedIcon color="primary" /> Add Item
            </Typography>

            <Autocomplete
              options={products}
              getOptionLabel={(option) => `${option.name} - $${option.price}`}
              value={selectedProduct}
              onChange={(event, newValue) => {
                setSelectedProduct(newValue);
                setQuantity(1);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Search Product by Name" variant="outlined" fullWidth size="medium" />
              )}
              sx={{ mb: 3 }}
            />

            <Box sx={{ minHeight: "100px", mb: 3 }}>
              {selectedProduct ? (
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: '12px', border: "1px solid #e2e8f0" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="#64748b" fontWeight="600">Available Stock</Typography>
                      <Typography variant="h6" fontWeight="700" color={selectedProduct.quantity < 10 ? "#ef4444" : "#10b981"}>
                        {selectedProduct.quantity} Pcs
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="#64748b" fontWeight="600">Unit Price</Typography>
                      <Typography variant="h6" fontWeight="700" color="#0f172a">${selectedProduct.price}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100px" color="#94a3b8" bgcolor="#f8fafc" borderRadius="12px" border="1px dashed #cbd5e1">
                  <Typography variant="body2">Select a product to view details</Typography>
                </Box>
              )}
            </Box>

            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={!selectedProduct}
              inputProps={{ min: 1 }}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1.5, borderRadius: '12px', fontSize: "16px", textTransform: "none", fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
              }}
              onClick={handleAddToCart}
              disabled={!selectedProduct}
            >
              Add to Cart
            </Button>
          </Paper>
        </Grid>

        {/* ================= RIGHT SIDE: CART & BILLING ================= */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper sx={{ ...modernPaperStyle, p: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            <Box sx={{ p: 2.5, bgcolor: "#ffffff", borderBottom: "1px solid #f1f5f9", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="700" color="#1e293b">
                Current Order Details
              </Typography>
              {customerName && (
                <Typography variant="body2" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', px: 2, py: 0.5, borderRadius: '20px', fontWeight: 'bold' }}>
                  Bill to: {customerName}
                </Typography>
              )}
            </Box>

            {/* Cart Table */}
            <TableContainer sx={{ flexGrow: 1, minHeight: "350px", maxHeight: "450px", bgcolor: '#fafbfc' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "700", color: '#475569', bgcolor: '#f8fafc' }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: "700", color: '#475569', bgcolor: '#f8fafc' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: "700", color: '#475569', bgcolor: '#f8fafc', textAlign: "center" }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: "700", color: '#475569', bgcolor: '#f8fafc' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: "700", color: '#475569', bgcolor: '#f8fafc', textAlign: "center" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 10, color: "#94a3b8" }}>
                        <ShoppingBagOutlinedIcon sx={{ fontSize: 60, opacity: 0.3, mb: 1 }} />
                        <Typography variant="h6" color="#64748b">Cart is empty</Typography>
                        <Typography variant="body2">Add items from the left panel to start billing</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((item) => (
                      <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: '600', color: '#0f172a' }}>{item.name}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>

                        {/* Interactive Quantity Cell */}
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                            <IconButton size="small" onClick={() => adjustCartQuantity(item.id, "decrement")} sx={{ color: '#64748b', bgcolor: '#f1f5f9' }}>
                              <RemoveCircleOutlineIcon fontSize="small" />
                            </IconButton>
                            <Typography fontWeight="bold" sx={{ minWidth: '24px' }}>{item.qty}</Typography>
                            <IconButton size="small" color="primary" onClick={() => adjustCartQuantity(item.id, "increment")} sx={{ bgcolor: '#e0f2fe' }}>
                              <AddCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>

                        <TableCell fontWeight="bold" color="#0f172a">${item.total.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleRemove(item.id)} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary & Checkout Section */}
            <Box sx={{ p: 3, bgcolor: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Apply Discount (%)"
                    type="number"
                    size="medium"
                    fullWidth
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="#64748b" fontWeight="600">Subtotal:</Typography>
                    <Typography fontWeight="700" color="#0f172a">${subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="#64748b" fontWeight="600">Discount:</Typography>
                    <Typography color="#ef4444" fontWeight="600">-${discountAmount.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1.5, borderColor: '#e2e8f0' }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="800" color="#0f172a">Total Due:</Typography>
                    <Typography variant="h4" fontWeight="900" color="#10b981">
                      ${grandTotal.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => navigate("/inventory")}
                    sx={{ py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', color: '#64748b', borderColor: '#cbd5e1' }}
                  >
                    Cancel Order
                  </Button>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PrintIcon />}
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    sx={{
                      py: 1.5, borderRadius: '12px', fontSize: "16px", textTransform: 'none', fontWeight: 'bold',
                      backgroundColor: '#10b981', // Emerald green for successful checkout
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      '&:hover': { backgroundColor: '#059669' }
                    }}
                  >
                    Pay & Print Invoice
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}