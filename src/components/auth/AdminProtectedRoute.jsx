import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      try {
        const token = localStorage.getItem('ds_admin_token');
        const session = localStorage.getItem('ds_admin_session');
        
        if (token && session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('ds_admin_token');
          localStorage.removeItem('ds_admin_session');
        }
      } catch (error) {
        console.error('Admin session check failed', error);
        setIsAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E63946]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-semibold tracking-wide">Verifying executive administrator session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Strictly redirect to Admin Login if no valid session
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
