import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Tabs,
  Tab,
  Modal,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";

const Profile = () => {
  const { userInfo, logout } = useAuth();
  const [gender, setGender] = useState("male");
  const [selectedTab, setSelectedTab] = useState(0);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setLogoutModalOpen(false);
    // Reset to the previous tab
    setSelectedTab(0); // Default to "Personal Information"
  };

  // Safe fallback if name is not split properly
  const nameParts = userInfo?.name ? userInfo.name.split(" ") : ["", ""];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#ffffff", // White background
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Optional shadow
        margin: "20px",
        borderRadius: "10px", // Rounded corners
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 300,
          backgroundColor: "#f4f6f8",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "10px 0 0 10px",
          borderRight: "1px solid #e0e0e0", // Border for separation
        }}
      >
        <Avatar
          alt="Profile Picture"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSksG4mm4xFN-Ufeaf1ZZ8ixWe2k4aZknK1MQ&s"
          sx={{ width: 100, height: 100, mb: 2 }}
        />
        <Typography variant="h6" fontWeight="bold">
          {userInfo?.name || "Loading..."}
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={3}>
          {userInfo?.role || "User"}
        </Typography>

        {/* Navigation */}
        <Tabs
          orientation="vertical"
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            width: "100%",
            ".MuiTab-root": {
              justifyContent: "flex-start",
              textAlign: "left",
              color: "#34495e",
              backgroundColor: "#f8f9fa",
              mb: 1,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "#e3e4e6",
              },
              "&.Mui-selected": {
                backgroundColor: "#ffffff",
                color: "#1976d2",
              },
            },
          }}
        >
          <Tab label="Personal Information" />
          <Tab label="Login & Password" />
          <Tab
            label="Logout"
            onClick={handleLogoutClick}
            sx={{
              color: "#e74c3c",
              "&:hover": { backgroundColor: "#fdecea" },
            }}
          />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4 }}>
        {selectedTab === 0 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              {/* Gender Selection */}
              <Grid item xs={12}>
                <FormControl>
                  <FormLabel>Gender</FormLabel>
                  <RadioGroup
                    row
                    value={gender}
                    onChange={handleGenderChange}
                    sx={{ mt: 1 }}
                  >
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* First Name and Last Name */}
              <Grid item xs={12} md={6}>
                <TextField label="First Name" variant="outlined" fullWidth value={firstName} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Last Name" variant="outlined" fullWidth value={lastName} />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  value={userInfo?.email || ""}
                  helperText="Verified"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              {/* Shop Name */}
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Shop Name" 
                  variant="outlined" 
                  fullWidth 
                  value={userInfo?.shopName || ""} 
                />
              </Grid>

              {/* Address (Leaving Placeholder as DB might not have it) */}
              <Grid item xs={12} md={6}>
                <TextField label="Address" variant="outlined" fullWidth defaultValue="305 Parker St." />
              </Grid>

              {/* Phone Number (Leaving Placeholder) */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  defaultValue="(ext) 505-028"
                />
              </Grid>
            </Grid>

            {/* Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
              <Button variant="outlined" color="error">
                Discard Changes
              </Button>
              <Button variant="contained" color="primary">
                Save Changes
              </Button>
            </Box>
          </Box>
        )}

        {selectedTab === 1 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              Login & Password
            </Typography>
            <Grid container spacing={3}>
              {/* Current Password */}
              <Grid item xs={12}>
                <TextField label="Current Password" type="password" variant="outlined" fullWidth />
              </Grid>
              {/* New Password */}
              <Grid item xs={12}>
                <TextField label="New Password" type="password" variant="outlined" fullWidth />
              </Grid>
              {/* Confirm New Password */}
              <Grid item xs={12}>
                <TextField
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
              <Button variant="outlined" color="error">
                Discard Changes
              </Button>
              <Button variant="contained" color="primary">
                Update Password
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Logout Modal */}
      <Modal
        open={logoutModalOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            backgroundColor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="logout-modal-title" variant="h6" component="h2" mb={2}>
            Confirm Logout
          </Typography>
          <Typography id="logout-modal-description" mb={3}>
            Are you sure you want to log out?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleLogoutCancel} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleLogoutConfirm} variant="contained" color="error">
              Logout
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Profile;
