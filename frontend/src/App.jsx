import React from "react";
import Inter from "../public/static/fonts/Inter.ttf";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import RootComponent from "./components/RootComponent";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

import MainDashboardWrapper from "./components/MainDashboardWrapper";
import Inventory from "./components/bodyComponents/inventory/Inventory";
// --- নতুন ইমপোর্ট করা ফাইল দুটি ---
import AddProduct from "./components/bodyComponents/inventory/AddProduct";
import SellProduct from "./components/bodyComponents/inventory/SellProduct";
// ---------------------------------

import Customer from "./components/bodyComponents/customer/Customer";
import Revenue from "./components/bodyComponents/revenue/Revenue";
import Growth from "./components/bodyComponents/growth/Growth";
import Report from "./components/bodyComponents/report/Report";
import Order from "./components/bodyComponents/order/Order";
import Login from "./components/Login";
import Profile from "./components/bodyComponents/profiles/Profile";
import Settings from "./components/bodyComponents/Settings/Setting";
import Register from "./components/Register";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import AiAnalytics from "./components/bodyComponents/report/AiAnalytics";
import SuperAdminPanel from "./components/bodyComponents/SuperAdmin/SuperAdminPanel";
import AllShops from "./components/bodyComponents/SuperAdmin/AllShops";
import Subscriptions from "./components/bodyComponents/SuperAdmin/Subscriptions";
import RevenueReports from "./components/bodyComponents/SuperAdmin/RevenueReports";
import GlobalSettings from "./components/bodyComponents/SuperAdmin/GlobalSettings";

import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const theme = createTheme({
    spacing: 4,
    palette: {
      mode: "light",
    },
    typography: {
      fontFamily: "Inter",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
            src: local('Raleway'), local('Raleway-Regular'), url(${Inter}) format('woff2');
            unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
          }
        `,
      },
    },
  });

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootComponent />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainDashboardWrapper />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRoute>
              <Inventory />
            </PrivateRoute>
          }
        />

        {/* --- নতুন রাউটগুলো শুরু --- */}
        <Route
          path="/add-product"
          element={
            <PrivateRoute>
              <AddProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/sell-product"
          element={
            <PrivateRoute>
              <SellProduct />
            </PrivateRoute>
          }
        />
        {/* --- নতুন রাউটগুলো শেষ --- */}

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Order />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <Customer />
            </PrivateRoute>
          }
        />
        <Route
          path="/revenue"
          element={
            <PrivateRoute>
              <Revenue />
            </PrivateRoute>
          }
        />
        <Route
          path="/growth"
          element={
            <PrivateRoute>
              <Growth />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Report />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-analytics"
          element={
            <PrivateRoute>
              <AiAnalytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/profiles"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <SuperAdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/allshops"
          element={
            <PrivateRoute>
              <AllShops />
            </PrivateRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <PrivateRoute>
              <Subscriptions />
            </PrivateRoute>
          }
        />
        <Route
          path="/revenuereports"
          element={
            <PrivateRoute>
              <RevenueReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/globalsettings"
          element={
            <PrivateRoute>
              <GlobalSettings />
            </PrivateRoute>
          }
        />
      </Route>
    )
  );

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
      <CssBaseline />
    </ThemeProvider>
  );
}

export default App;