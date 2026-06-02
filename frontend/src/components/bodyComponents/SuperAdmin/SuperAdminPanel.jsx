import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Grid, Card, CardContent, Avatar, Chip, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
export default function SuperAdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalShops: 0, activeSubs: 0, mrr: 0, newShops: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const statsRes = await fetch("http://localhost:5000/api/superadmin/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      const shopsRes = await fetch("http://localhost:5000/api/superadmin/shops", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        const formatted = shopsData.map(s => {
          let color = "success";
          if (s.status === "Pending") color = "warning";
          else if (s.status === "Rejected" || s.status === "Restricted") color = "error";

          return {
            ...s,
            shopName: s.name,
            email: s.owner,
            statusObj: { label: s.status, color: color }
          };
        });
        setUsers(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this shop?")) return;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Active', statusObj: { label: 'Active', color: 'success' } } : u));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/shops/${id}/approve`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) fetchDashboardData();
    } catch (err) { fetchDashboardData(); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this shop?")) return;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Rejected', statusObj: { label: 'Rejected', color: 'error' } } : u));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/shops/${id}/reject`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) fetchDashboardData();
    } catch (err) { fetchDashboardData(); }
  };

  const handleToggleStatus = async (id) => {
    // Optimistic UI Update
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const isCurrentlyRestricted = u.status === "Restricted";
        const newStatus = isCurrentlyRestricted ? "Active" : "Restricted";
        return {
          ...u,
          status: newStatus,
          statusObj: { label: newStatus, color: newStatus === "Active" ? "success" : "error" }
        };
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
        fetchDashboardData(); // Revert on error
      }
    } catch (err) {
      console.error(err);
      fetchDashboardData();
    }
  };

  const ActionMenu = ({ row }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const isRestricted = row.status === "Suspended" || row.status === "Restricted" || row.statusObj?.label === "Suspended" || row.statusObj?.label === "Restricted";

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
    { field: "shopName", headerName: "Shop Name", flex: 1, minWidth: 150, renderCell: (params) => <Typography variant="subtitle2" fontWeight="bold">{params.value || "N/A"}</Typography> },
    { field: "email", headerName: "Owner Email", flex: 1, minWidth: 200 },
    { field: "plan", headerName: "Plan", flex: 1, minWidth: 150 },
    {
      field: "statusObj",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Chip
          label={params.value?.label || "Active"}
          color={params.value?.color || "success"}
          size="small"
          sx={{ borderRadius: 1, fontWeight: "bold", fontSize: "12px", height: "24px", color: params.value?.color === 'info' ? '#007FFF' : undefined, bgcolor: params.value?.color === 'info' ? '#e6f2ff' : undefined }}
        />
      )
    },
    { field: "joinedDate", headerName: "Joined Date", flex: 1, minWidth: 150 },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ActionMenu row={params.row} />
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: "100%" }}>
      <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
        Platform Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
              <Avatar sx={{ bgcolor: '#eff2ff', color: '#6366f1', width: 56, height: 56, mr: 2 }}>
                <StorefrontIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">Total Shops Registered</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.totalShops}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
              <Avatar sx={{ bgcolor: '#e6fbd9', color: '#34d399', width: 56, height: 56, mr: 2 }}>
                <TaskAltIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">Active Subscriptions</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.activeSubs}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
              <Avatar sx={{ bgcolor: '#fae8ff', color: '#d946ef', width: 56, height: 56, mr: 2 }}>
                <AccountBalanceWalletIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">Monthly Recurring Revenue (MRR)</Typography>
                <Typography variant="h5" fontWeight="bold">${stats.mrr}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
              <Avatar sx={{ bgcolor: '#fff3cd', color: '#f59e0b', width: 56, height: 56, mr: 2 }}>
                <PersonAddIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500">New Shops (This Month)</Typography>
                <Typography variant="h5" fontWeight="bold">+{stats.newShops}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table Section */}
      <Paper sx={{ p: 0, borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0', overflow: "hidden" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f0f0f0">
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Recent Onboarded Shops
          </Typography>
          <Button variant="contained" sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 1.5, textTransform: "none", fontWeight: "bold" }}>
            View All
          </Button>
        </Box>
        <Box sx={{ width: '100%', height: 400 }}>
          <DataGrid
            rows={users}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#ffffff',
                color: '#6b7280',
                fontSize: '13px',
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
                fontSize: '14px',
              }
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
