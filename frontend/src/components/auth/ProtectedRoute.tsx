import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@shared/types';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { DiyaIcon, MandalaCorner } from '../layout/IndianMotifs';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAdmin = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-utsav-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Verifying authorization credentials...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    if (requireAdmin || location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check Admin Requirement
  if (requireAdmin && user.role !== 'ADMIN') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-950 border-2 border-red-500/60 shadow-2xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 pointer-events-none opacity-15">
            <MandalaCorner className="w-32 h-32" />
          </div>

          <div className="inline-flex p-4 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 border border-red-300 dark:border-red-800 shadow-md">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300">
              HTTP 403 Forbidden
            </span>
            <h1 className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Access Denied
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              You don't have permission to access this page. Administrator privileges are required to view the requested resource.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/dashboard'}
              className="px-5 py-3 rounded-xl maroon-gradient-btn font-bold text-xs text-utsav-gold shadow-md flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check specific allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-950 border-2 border-utsav-gold/60 shadow-2xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex p-4 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 border border-amber-300 dark:border-amber-800 shadow-md">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              HTTP 403 Forbidden
            </span>
            <h1 className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Access Restricted
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              You don't have permission to access this page. This section is reserved for {allowedRoles.join(' / ')} accounts.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link
              to={user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/dashboard'}
              className="px-5 py-3 rounded-xl maroon-gradient-btn font-bold text-xs text-utsav-gold shadow-md flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to My Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
