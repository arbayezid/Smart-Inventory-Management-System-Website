import React from "react";
import NavBarComponent from "./NavBarComponent";
import { Box } from "@mui/material";

import SideBarComponent from "./SideBarComponent";
import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootComponent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <AuthProvider>
      {!isAuthPage && <NavBarComponent />}
      <Box sx={{ display: "flex" }}>
        {!isAuthPage && (
          <Box
            sx={{
              width: { xs: 0, md: "16.666%" },
              flexShrink: 0,
              position: "sticky",
              top: 0,
              height: "100vh",
              overflowY: "auto",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <SideBarComponent />
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </AuthProvider>
  );
}
