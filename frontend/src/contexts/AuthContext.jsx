import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../public/firebase-config";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const res = await fetch("http://localhost:5000/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firebaseUid: user.uid,
              email: user.email,
              name: user.displayName || user.email,
              role: "ShopOwner" 
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setToken(data.token);
            setUserInfo(data);
            localStorage.setItem("token", data.token);
            localStorage.setItem("userInfo", JSON.stringify(data));
          } else {
            if (res.status === 403) {
              await firebaseSignOut(auth);
              setCurrentUser(null);
              setToken(null);
              setUserInfo(null);
              localStorage.removeItem("token");
              localStorage.removeItem("userInfo");
            }
          }
        } catch (err) {
          console.error("Auth sync error:", err);
        }
      } else {
        setCurrentUser(null);
        setToken(null);
        setUserInfo(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginUser = (apiData) => {
    setToken(apiData.token);
    setUserInfo(apiData);
    localStorage.setItem("token", apiData.token);
    localStorage.setItem("userInfo", JSON.stringify(apiData));
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setToken(null);
    setUserInfo(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  };

  const value = {
    currentUser,
    token,
    userInfo,
    loginUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
