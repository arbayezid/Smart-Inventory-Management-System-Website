import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, TextField, Button, Switch, FormControlLabel, Divider } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';

export default function GlobalSettings() {
  const [settings, setSettings] = useState({
    platformName: "Smart Inventory SaaS",
    supportEmail: "support@smartinventory.com",
    contactNumber: "+880 1234 567890",
    enableNewRegistrations: true,
    maintenanceMode: false,
    emailNotifications: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://smart-inventory-management-system-backend.onrender.com/api/superadmin/settings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setSettings(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://smart-inventory-management-system-backend.onrender.com/api/superadmin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: "100%", bgcolor: "#f9fafb" }}>
      <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
        Global Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Left Side Settings */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Platform Details</Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="platformName" label="Platform Name" value={settings.platformName} onChange={handleChange} variant="outlined" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="supportEmail" label="Support Email" value={settings.supportEmail} onChange={handleChange} variant="outlined" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth name="contactNumber" label="Contact Number" value={settings.contactNumber} onChange={handleChange} variant="outlined" InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>

            <Box mt={4} display="flex" justifyContent="flex-end">
              <Button variant="contained" disabled={saving} onClick={handleSave} startIcon={<SaveIcon />} sx={{ bgcolor: '#6366f1', textTransform: 'none' }}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side Settings */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)', border: '1px solid #f0f0f0' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>System Controls</Typography>

            <Box mb={2}>
              <FormControlLabel control={<Switch name="enableNewRegistrations" checked={settings.enableNewRegistrations} onChange={handleChange} color="primary" />} label="Enable New Registrations" />
              <Typography variant="body2" color="text.secondary" ml={4}>Allow new shops to sign up and start 14-day trials.</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <FormControlLabel control={<Switch name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} color="primary" />} label="Maintenance Mode" />
              <Typography variant="body2" color="text.secondary" ml={4}>Turn off tenant access temporarily for system updates.</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <FormControlLabel control={<Switch name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} color="primary" />} label="Email Notifications" />
              <Typography variant="body2" color="text.secondary" ml={4}>Send automated billing and payment reminders.</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}