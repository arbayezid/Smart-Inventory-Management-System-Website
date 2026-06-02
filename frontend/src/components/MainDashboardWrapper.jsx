import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Home from './bodyComponents/Home/Home';

export default function MainDashboardWrapper() {
    const { userInfo } = useAuth();
    
    if (userInfo && userInfo.role === "SuperAdmin") {
        return <Navigate to="/dashboard" replace />;
    }
    
    return <Home />;
}
