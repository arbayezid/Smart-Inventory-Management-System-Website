import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
} from "@mui/material";

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f4f6f8", margin: "20px", borderRadius: "10px 10px 10px 10px"  }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 300,
          backgroundColor: "#ffffff",
          p: 2,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px 0 0 10px"
        }}
      >
        <Tabs
          orientation="vertical"
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            ".MuiTab-root": {
              justifyContent: "flex-start",
              textAlign: "left",
              color: "#34495e",
              mb: 1,
              "&:hover": {
                backgroundColor: "#e3e4e6",
              },
              "&.Mui-selected": {
                backgroundColor: "#ffffff",
                color: "#1976d2", // Updated active tab text color
                fontWeight: "bold",
                borderLeft: "none", // Removed green left border
              },
            },
          }}
        >
          <Tab label="Settings" />
          <Tab label="Payment Method" />
          <Tab label="Store" />
          <Tab label="Till" />
          <Tab label="Loyalty Level" />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4, backgroundColor: "#ffffff", borderRadius: "0 10px 10px 0" }}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: "10px", // Added border-radius
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {selectedTab === 0 && (
            <Box>              
              <Grid container spacing={2}>
                {/* Discounts Section */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                    }}
                  >
                    Discounts
                  </Typography>
                  <Box sx={{ py: 2 }}>
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Allow Manual Discount"
                    />
                  </Box>
                </Grid>

                {/* Payments Section */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                    }}
                  >
                    Payments
                  </Typography>
                  <Box sx={{ py: 2 }}>
                    <FormControlLabel control={<Checkbox />} label="Enable Cash" />
                    <FormControlLabel control={<Checkbox />} label="Enable Card" />
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Allow Split Tender"
                    />
                  </Box>
                </Grid>

                {/* Customer Section */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                    }}
                  >
                    Customer
                  </Typography>
                  <Box sx={{ py: 2 }}>
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Customer Search"
                    />
                    <FormControlLabel control={<Checkbox />} label="Search By" />
                  </Box>
                </Grid>

                {/* Cash Register Section */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                    }}
                  >
                    Cash Register
                  </Typography>
                  <Box sx={{ py: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={<Checkbox />}
                          label="Enable Shift Open"
                        />
                        <FormControlLabel
                          control={<Checkbox />}
                          label="Enable Shift Close"
                        />
                        <FormControlLabel
                          control={<Checkbox />}
                          label="Allow Petty Cash"
                        />
                        <FormControlLabel
                          control={<Checkbox />}
                          label="Allow Cash In"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={<Checkbox />}
                          label="Show Cash Denominations"
                        />
                        <FormControlLabel
                          control={<Checkbox />}
                          label="Enable Day Close"
                        />
                        <FormControlLabel
                          control={<Checkbox />}
                          label="Allow Cash Out"
                        />
                        <FormControlLabel
                          control={<Checkbox />}
                          label="Allow Logout (Without Shift Close)"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {selectedTab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Payment Method
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography>Configure payment method settings here.</Typography>
            </Box>
          )}

          {selectedTab === 2 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Store
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography>Manage store-specific settings here.</Typography>
            </Box>
          )}

          {selectedTab === 3 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Till
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography>Manage till-related settings here.</Typography>
            </Box>
          )}

          {selectedTab === 4 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Loyalty Level
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography>Set up loyalty levels for customers here.</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Settings;
