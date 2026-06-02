import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  Divider,
  Alert,
  Avatar,
  Stack,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom"; // For redirection
import { auth } from "../../public/firebase-config"; // Adjust path as needed

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Logged in user:", userCredential.user);

      const res = await fetch("https://smart-inventory-management-system-backend.onrender.com/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || userCredential.user.email,
          role: "ShopOwner",
        }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          const errMsg =
            errorData.message || "Account restricted, please contact to admin";
          alert(errMsg);
          setError(errMsg);
          return; // Wait for AuthContext to sign them out
        }
      }

      alert("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.code || error.message);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      )
        setError("User not found or incorrect password.");
      else if (error.code === "auth/wrong-password")
        setError("Incorrect password.");
      else setError("Login failed.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign In successful:", result.user);
      const res = await fetch("https://smart-inventory-management-system-backend.onrender.com/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || result.user.email,
          role: "ShopOwner",
        }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          const errMsg =
            errorData.message || "Account restricted, please contact to admin";
          alert(errMsg);
          setError(errMsg);
          return; // Wait for AuthContext to sign them out
        }
      }

      alert("Google Sign In successful!");
      navigate("/");
    } catch (error) {
      console.error("Google Sign In error:", error.message);
      setError("Failed to sign in with Google.");
    }
  };

  // Modern input styling matching the Register page
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f9fafb",
      "& fieldset": {
        borderColor: "#e5e7eb",
      },
      "&:hover fieldset": {
        borderColor: "#3b82f6",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2563eb",
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", // Same premium gradient
        padding: 2,
      }}
    >
      {/* Centered Glassmorphism Card */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          padding: { xs: 4, sm: 6 },
          textAlign: "center",
        }}
      >
        {/* Logo / Icon */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: "#1976d2",
              width: 56,
              height: 56,
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
            }}
          >
            <StorefrontIcon fontSize="large" />
          </Avatar>
        </Box>

        <Typography variant="h4" fontWeight="800" color="#111827" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="#6b7280" mb={4}>
          Please enter your details to sign in to your shop.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "10px", textAlign: "left" }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2.5} sx={{ mb: 2, textAlign: "left" }}>
          <TextField
            label="Email Address"
            variant="outlined"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={inputStyle}
          />

          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={inputStyle}
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="#4b5563">
                Remember for 30 days
              </Typography>
            }
          />
          <Link
            href="/forgot-password"
            variant="body2"
            underline="hover"
            sx={{ fontWeight: "600", color: "#1976d2" }}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          sx={{
            py: 1.5,
            bgcolor: "#1976d2",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "12px",
            textTransform: "none",
            boxShadow: "0 8px 16px rgba(25, 118, 210, 0.24)",
            "&:hover": {
              bgcolor: "#1565c0",
              boxShadow: "0 10px 20px rgba(25, 118, 210, 0.4)",
            },
          }}
        >
          Sign in
        </Button>

        <Divider sx={{ my: 3, color: "#9ca3af", fontSize: "0.85rem" }}>
          or continue with
        </Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon sx={{ color: "#EA4335" }} />}
          onClick={handleGoogleSignIn}
          sx={{
            py: 1.2,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: "12px",
            borderColor: "#d1d5db",
            color: "#374151",
            bgcolor: "#ffffff",
            "&:hover": {
              bgcolor: "#f3f4f6",
              borderColor: "#d1d5db",
            },
          }}
        >
          Sign in with Google
        </Button>

        <Typography variant="body2" sx={{ mt: 4, color: "#4b5563" }}>
          Don’t have an account?{" "}
          <Link
            href="/register"
            underline="none"
            sx={{ fontWeight: "700", color: "#1976d2" }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;