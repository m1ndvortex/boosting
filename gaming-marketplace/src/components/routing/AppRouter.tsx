import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DiscordLogin } from '../../pages/auth/DiscordLogin';
import { AdminDashboard } from '../../pages/admin/AdminDashboard';
import { ServiceProviderDashboard } from '../../pages/dashboard/ServiceProviderDashboard';
import type { User } from '../../types';

// Helper function to check if user has a specific role
const hasRole = (user: User, roleName: string): boolean => {
  return user.roles.some(
    (role) => role.name === roleName && role.status === 'active'
  );
};

// Helper function to determine dashboard route based on user roles
const getDashboardRoute = (user: User): string => {
  // Admin users go to Admin Dashboard
  if (hasRole(user, 'admin')) {
    return '/admin';
  }
  
  // All other authenticated users go to Service Provider Dashboard
  return '/dashboard';
};

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
}) => {
  const { state } = useAuth();

  // Check authentication
  if (requireAuth && !state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check specific role requirement
  if (requiredRole && state.user && !hasRole(state.user, requiredRole)) {
    // Redirect to appropriate dashboard if user doesn't have required role
    return <Navigate to={getDashboardRoute(state.user)} replace />;
  }

  return <>{children}</>;
};

// Main app router component
export const AppRouter: React.FC = () => {
  const { state } = useAuth();

  // Show loading state while checking authentication
  if (state.loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          state.isAuthenticated ? (
            <Navigate to={getDashboardRoute(state.user!)} replace />
          ) : (
            <DiscordLogin />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <ServiceProviderDashboard />
          </ProtectedRoute>
        }
      />

      {/* Marketplace routes - available to all authenticated users */}
      <Route
        path="/marketplace/*"
        element={
          <ProtectedRoute>
            <div>Marketplace (Coming Soon)</div>
          </ProtectedRoute>
        }
      />

      {/* Shop routes - available to all authenticated users */}
      <Route
        path="/shop/*"
        element={
          <ProtectedRoute>
            <div>Shop (Coming Soon)</div>
          </ProtectedRoute>
        }
      />

      {/* Wallet routes - available to all authenticated users */}
      <Route
        path="/wallet/*"
        element={
          <ProtectedRoute>
            <div>Wallet (Coming Soon)</div>
          </ProtectedRoute>
        }
      />

      {/* Default redirects */}
      <Route
        path="/"
        element={
          state.isAuthenticated ? (
            <Navigate to={getDashboardRoute(state.user!)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all - redirect to appropriate dashboard or login */}
      <Route
        path="*"
        element={
          state.isAuthenticated ? (
            <Navigate to={getDashboardRoute(state.user!)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};