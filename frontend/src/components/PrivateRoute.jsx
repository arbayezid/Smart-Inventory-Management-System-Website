import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../public/firebase-config";

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false); // Stop loading once we get auth status
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>; // Show a loading screen while checking auth
  }

  if (!user) {
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};

export default PrivateRoute;
