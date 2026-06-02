import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, InputBase, IconButton, Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, Tabs, Tab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { DataGrid } from "@mui/x-data-grid";

export default function AllShops() {
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newShop, setNewShop] = useState({ shopName: '', email: '', plan: 'Basic', status: 'Active' });
  const [tabValue, setTabValue] = useState("All");

  const fetchShops = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/superadmin/shops", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRows(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this shop?")) return;
    setRows(prev => prev.map(u => u.id === id ? { ...u, status: 'Active' } : u));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/shops/${id}/approve`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) fetchShops();
    } catch (err) { fetchShops(); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this shop?")) return;
    setRows(prev => prev.map(u => u.id === id ? { ...u, status: 'Rejected' } : u));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/shops/${id}/reject`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) fetchShops();
    } catch (err) { fetchShops(); }
  };

  const handleToggleStatus = async (id) => {
    // Optimistic UI Update
    setRows(prev => prev.map(u => {
      if (u.id === id) {
        const isCurrentlyRestricted = u.status === "Restricted";
        const newStatus = isCurrentlyRestricted ? "Active" : "Restricted";
        return { ...u, status: newStatus };
      }
      return u;
    }));

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${id}/toggle-status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(`Backend Error: Failed to toggle shop status. ${errorData.message || ''}\nPlease make sure you restarted the backend server.`);
        fetchShops(); // Revert on failure
      }
    } catch (err) {
      console.error(err);
      fetchShops();
    }
  };

  const handleAddShop = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/superadmin/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newShop)
      });
      if (res.ok) {
        setOpenDialog(false);
        setNewShop({ shopName: '', email: '', plan: 'Basic', status: 'Active' });
        fetchShops();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create shop");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const ActionMenu = ({ row }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const isRestricted = row.status === "Suspended" || row.status === "Restricted";

    return (
      <>
        <IconButton size="small" sx={{ color: '#6366f1' }} onClick={handleClick}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {row.status === "Pending" ? [
            <MenuItem key="approve" onClick={() => { handleClose(); handleApprove(row.id); }} sx={{ color: 'success.main' }}>
              ✅ Approve
            </MenuItem>,
            <MenuItem key="reject" onClick={() => { handleClose(); handleReject(row.id); }} sx={{ color: 'error.main' }}>
              ❌ Reject
            </MenuItem>
          ] : row.status === "Active" ? (
            <MenuItem onClick={() => { handleClose(); handleToggleStatus(row.id); }}>
              🚫 Restrict Shop
            </MenuItem>
          ) : row.status === "Restricted" ? (
            <MenuItem onClick={() => { handleClose(); handleToggleStatus(row.id); }}>
              ✅ Enable Shop
            </MenuItem>
          ) : (
            <MenuItem disabled>No actions available</MenuItem>
          )}
        </Menu>
      </>
    );
  };

  const columns = [
    { field: "name", headerName: "Shop Name", flex: 1, minWidth: 150, renderCell: (params) => <Typography variant="subtitle2" fontWeight="bold">{params.value}</Typography> },
    { field: "owner", headerName: "Owner Email", flex: 1, minWidth: 180 },
    { field: "plan", headerName: "Plan", width: 120 },
    { field: "mrr", headerName: "MRR", width: 100, fontWeight: "bold" },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        let color = "success";
        if (params.value === "Pending") color = "warning";
        else if (params.value === "Rejected" || params.value === "Restricted") color = "error";
        return <Chip label={params.value} color={color} size="small" sx={{ fontWeight: "bold", fontSize: "12px", height: "24px" }} />;
      }
    },
    { field: "joinedDate", headerName: "Joined Date", width: 130 },
    {
      field: "actions",
      headerName: "Action",
      width: 80,
      align: "center",
      renderCell: (params) => <ActionMenu row={params.row} />
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: "100%", bgcolor: "#f9fafb" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          All Shops
        </Typography>
        <Button onClick={() => setOpenDialog(true)} variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, textTransform: "none", borderRadius: 2 }}>
          Add New Shop
        </Button>
      </Box>

      <Paper sx={{ p: 0, borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0', overflow: "hidden" }}>
        {/* Toolbar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #f0f0f0" bgcolor="#fff">
          <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 300, border: '1px solid #e0e0e0', boxShadow: 'none', borderRadius: 2 }}>
            <IconButton sx={{ p: '10px' }} aria-label="search"><SearchIcon /></IconButton>
            <InputBase sx={{ ml: 1, flex: 1, fontSize: '14px' }} placeholder="Search shops or emails..." />
          </Paper>
          <Button startIcon={<FilterListIcon />} sx={{ color: '#6b7280', textTransform: 'none' }}>Filters</Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} textColor="primary" indicatorColor="primary">
            <Tab label="All Shops" value="All" />
            <Tab label={`Pending (${rows.filter(r => r.status === 'Pending').length})`} value="Pending" />
            <Tab label="Active" value="Active" />
            <Tab label="Rejected / Restricted" value="Rejected" />
          </Tabs>
        </Box>

        {/* DataGrid */}
        <Box sx={{ width: '100%', height: 500, bgcolor: "#fff" }}>
          <DataGrid 
            rows={rows.filter(r => {
              if (tabValue === "All") return true;
              if (tabValue === "Pending") return r.status === "Pending";
              if (tabValue === "Active") return r.status === "Active";
              if (tabValue === "Rejected") return r.status === "Rejected" || r.status === "Restricted";
              return true;
            })} 
            columns={columns} 
            disableRowSelectionOnClick 
            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#fdfdfd' } }} 
          />
        </Box>
      </Paper>

      {/* Add Shop Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Add New Shop</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Shop Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newShop.shopName}
            onChange={(e) => setNewShop({ ...newShop, shopName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Owner Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newShop.email}
            onChange={(e) => setNewShop({ ...newShop, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Plan</InputLabel>
            <Select
              value={newShop.plan}
              label="Plan"
              onChange={(e) => setNewShop({ ...newShop, plan: e.target.value })}
            >
              <MenuItem value="Basic">Basic Plan</MenuItem>
              <MenuItem value="Premium">Premium Plan</MenuItem>
              <MenuItem value="Enterprise">Enterprise Plan</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
          <Button onClick={handleAddShop} variant="contained" sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
            Create Shop
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}