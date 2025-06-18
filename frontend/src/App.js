// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import your page components
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Reports from './pages/Reports'; // Make sure you've created this file
import UserManagement from './pages/UserManagement'; // Make sure you've created this file

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user ? user.role : null; // Get the user's role, default to null

  if (!token) {
    // If no token, the user isn't authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and the user's role isn't among them, they're unauthorized
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the children (the protected component)
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          {/* Public Route for Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin', 'analyst', 'viewer']}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <PrivateRoute allowedRoles={['admin', 'analyst', 'viewer']}> {/* Changed to allow viewers to see clients list */}
                <Clients />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <PrivateRoute allowedRoles={['admin', 'analyst', 'viewer']}>
                <ClientDetail />
              </PrivateRoute>
            }
          />

          {/* New Routes for Reports and User Management */}
          <Route
            path="/reports"
            element={
              <PrivateRoute allowedRoles={['admin', 'analyst']}> {/* Reports often for admins/analysts */}
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={['admin']}> {/* User management is typically admin-only */}
                <UserManagement />
              </PrivateRoute>
            }
          />

          {/* Unauthorized Page */}
          <Route
            path="/unauthorized"
            element={
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-red-600">403 - Access Denied</h1>
                <p className="text-gray-700 mt-2">You do not have permission to view this page.</p>
              </div>
            }
          />

          {/* Default Route: Redirect based on authentication status */}
          <Route
            path="/"
            element={
              localStorage.getItem('token') ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all for any other unmatched routes */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-gray-800">404 - Page Not Found</h1>
                <p className="text-gray-700 mt-2">The page you're looking for doesn't exist.</p>
              </div>
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;