import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { useAdminCheck } from '../hooks/useAdminCheck';

/**
 * Route guard that only allows admin users through.
 * Non-admins are redirected to /dashboard.
 * Shows a loading spinner while checking auth status.
 */
export default function AdminRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const { isAdmin, loading } = useAdminCheck();

  // Wait for both Clerk and admin check to resolve
  if (!isLoaded || loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
