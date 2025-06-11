// src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../context/userContext'; // Adjust path as necessary

const PrivateRoute = () => {
  const { user, loading } = useContext(UserContext);

  // 1. If still loading the authentication status:
  //    Display a loading message or spinner. Do NOT render the protected content yet.
  if (loading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '20px',
      color: '#333'
    }}>Loading authentication...</div>;
  }

  // 2. If loading is complete AND a user object exists:
  //    This means the user is authenticated. Render the nested routes (Outlet).
  if (user) {
    return <Outlet />;
  }

  // 3. If loading is complete AND no user object exists:
  //    This means the user is NOT authenticated. Redirect to the login page.
  //    'replace' prop prevents going back to the protected route with the browser's back button.
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;