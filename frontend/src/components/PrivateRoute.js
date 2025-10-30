import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
  const role = localStorage.getItem('userRole');

  return allowedRoles.includes(role)
    ? <Outlet />
    : <Navigate to="/unauthorized" replace />;
};

export default PrivateRoute;
