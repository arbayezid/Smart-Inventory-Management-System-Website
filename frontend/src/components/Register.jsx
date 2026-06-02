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
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../public/firebase-config"; // Adjust path as needed

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Handle user registration
  const handleRegister = async () => {
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL || "https://via.placeholder.com/150",
      });

      console.log("User registered and profile updated:", user);

      try {
        const res = await fetch("http://localhost:5000/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firebaseUid: user.uid,
            email: user.email,
            name: name,
            role: "ShopOwner",
            shopName: shopName || "My Shop",
          }),
        });

        if (!res.ok && res.status === 403) {
          alert(
            "Registration successful. Your shop request has been sent and is waiting for admin approval."
          );
          await auth.signOut();
          navigate("/login");
          return;
        }
      } catch (err) {
        console.error("Failed to sync user data to backend", err);
      }

      alert("Registration successful!");
      navigate("/");
    } catch (error) {
      console.error("Error registering user:", error.message);
      setError("Failed to register: " + error.message);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await fetch("http://localhost:5000/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          name: user.displayName || user.email,
          role: "ShopOwner",
          shopName: "My Shop",
        }),
      });

      if (!res.ok && res.status === 403) {
        alert(
          "Registration successful. Your shop request has been sent and is waiting for admin approval."
        );
        await auth.signOut();
        navigate("/login");
        return;
      }

      alert("Google Sign In successful!");
      navigate("/");
    } catch (error) {
      console.error("Error with Google Sign In:", error.message);
      setError("Failed to sign in with Google: " + error.message);
    }
  };

  // Modern input styling
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px", // More rounded corners
      backgroundColor: "#f9fafb", // Soft gray background inside inputs
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
        // Beautiful modern gradient background
        background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
        padding: 2,
      }}
    >
      {/* Centered Glassmorphism Card */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(255, 255, 255, 0.95)", // Almost solid white with slight transparency
          backdropFilter: "blur(20px)", // Glass blur effect
          borderRadius: "24px", // Huge smooth rounded corners
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)", // Soft floating shadow
          padding: { xs: 4, sm: 6 },
          textAlign: "center",
        }}
      >
        {/* Logo / Icon */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: "#1976d2", // Dashboard Primary Color
              width: 56,
              height: 56,
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
            }}
          >
            <StorefrontIcon fontSize="large" />
          </Avatar>
        </Box>

        <Typography variant="h4" fontWeight="800" color="#111827" gutterBottom>
          Create your Shop
        </Typography>
        <Typography variant="body2" color="#6b7280" mb={4}>
          Sign up to manage your inventory and grow your business today.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "10px", textAlign: "left" }}>
            {error}
          </Alert>
        )}

        {/* Inputs Stacked Cleanly */}
        <Stack spacing={2.5} sx={{ mb: 3, textAlign: "left" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={inputStyle}
            />
            <TextField
              label="Shop Name"
              variant="outlined"
              fullWidth
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              sx={inputStyle}
            />
          </Stack>

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

        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 3 }}>
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
                I agree to the <Link href="#">Terms & Conditions</Link>
              </Typography>
            }
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleRegister}
          sx={{
            py: 1.5,
            bgcolor: "#1976d2", // Dashboard primary color
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "12px", // Pill-like rounded button
            textTransform: "none",
            boxShadow: "0 8px 16px rgba(25, 118, 210, 0.24)",
            "&:hover": {
              bgcolor: "#1565c0",
              boxShadow: "0 10px 20px rgba(25, 118, 210, 0.4)",
            },
          }}
        >
          Create Account
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
          Google
        </Button>

        <Typography variant="body2" sx={{ mt: 4, color: "#4b5563" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            underline="none"
            sx={{ fontWeight: "700", color: "#1976d2" }}
          >
            Log in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;