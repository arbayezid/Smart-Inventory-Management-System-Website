import React, { useState } from "react";
import "../../public/styles/links.css";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Box,
} from "@mui/material";
import {
  HomeOutlined,
  Inventory2Outlined,
  SettingsOutlined,
  DescriptionOutlined,
  MonetizationOnOutlined,
  CardTravelOutlined,
  TrendingUpOutlined,
  PeopleAltOutlined,
  AutoAwesome,
  AdminPanelSettings,
  LogoutOutlined,
  StorefrontOutlined,
  CardMembershipOutlined,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function SideBarComponent() {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuth();

  const navigateTo = (to) => {
    if (to === "home") {
      navigate("/");
    } else {
      navigate(`/${to}`);
    }
  };
  const location = useLocation();
  const currentPage = location.pathname;

  let sideBarComponent = [];

  if (userInfo && userInfo.role === "SuperAdmin") {
    sideBarComponent = [
      {
        title: "Dashboard",
        component: <HomeOutlined fontSize="medium" color="primary" />,
      },
      {
        title: "All Shops",
        component: <StorefrontOutlined fontSize="medium" color="primary" />,
      },
      {
        title: "Subscriptions",
        component: <CardMembershipOutlined fontSize="medium" color="primary" />,
      },
      {
        title: "Revenue Reports",
        component: <TrendingUpOutlined fontSize="medium" color="primary" />,
      },
      {
        title: "Global Settings",
        component: <SettingsOutlined fontSize="medium" color="primary" />,
      },
    ];
  } else {
    sideBarComponent = [
      {
        title: "Home",
        component: <HomeOutlined fontSize="medium" color="primary" />,
      },
      {
        title: "Inventory",
        component: <Inventory2Outlined fontSize="medium" color="primary" />,
      },
      // {
      //   title: "Orders",
      //   component: <CardTravelOutlined fontSize="medium" color="primary" />,
      // },
      {
        title: "Customers",
        component: <PeopleAltOutlined fontSize="medium" color="primary" />,
      },
      {
        title: "Revenue",
        component: <MonetizationOnOutlined fontSize="medium" color="primary" />,
      },
      {
        title: "Growth",
        component: <TrendingUpOutlined fontSize="medium" color="primary" />,
      },
      {
        title: "Reports",
        component: <DescriptionOutlined fontSize="medium" color="primary" />,
      },
      {
        title: "AI Analytics",
        component: <AutoAwesome fontSize="medium" color="primary" />,
        path: "ai-analytics",
      },
      // {
      //   title: "Settings",
      //   component: <SettingsOutlined fontSize="medium" color="primary" />,
      // },
    ];
  }

  const getPath = (comp) => comp.path || comp.title.toLowerCase().replace(/\s/g, '');

  const isSelected = (comp) => {
    const slug = getPath(comp);
    if (slug === 'home' || slug === 'dashboard') {
      return currentPage === '/' || currentPage === `/${slug}`;
    }
    return currentPage === `/${slug}` || currentPage.startsWith(`/${slug}/`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <List>
        {sideBarComponent.map((comp, index) => {
          const active = isSelected(comp);
          return (
            <ListItem disablePadding dense={true} key={index}>
              <Box width="100%">
                <ListItemButton
                  onClick={() => {
                    navigateTo(getPath(comp));
                  }}
                  selected={active}
                  sx={{
                    mb: 3,
                    borderLeft: 0,
                    borderColor: "primary.main",
                    ml: 1,
                  }}
                >
                  <ListItemIcon>
                    <IconButton>{comp.component}</IconButton>
                  </ListItemIcon>
                  <ListItemText
                    primary={comp.title}
                    primaryTypographyProps={{
                      fontSize: "medium",
                      fontWeight: active ? "bold" : "",
                      color: active ? "primary.main" : "inherit",
                    }}
                  />
                </ListItemButton>
              </Box>
            </ListItem>
          )
        })}

        {/* LOGOUT BUTTON */}
        <ListItem disablePadding dense={true}>
          <Box width="100%">
            <ListItemButton
              onClick={handleLogout}
              sx={{ mb: 3, borderLeft: 0, borderColor: "primary.main", ml: 1 }}
            >
              <ListItemIcon>
                <IconButton><LogoutOutlined fontSize="medium" color="error" /></IconButton>
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: "medium", color: "error.main" }}
              />
            </ListItemButton>
          </Box>
        </ListItem>
      </List>
    </>
  );
}
