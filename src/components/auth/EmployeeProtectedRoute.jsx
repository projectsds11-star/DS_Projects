import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function EmployeeProtectedRoute({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      try {
        const token = localStorage.getItem('ds_employee_token');
        const empId = localStorage.getItem('ds_current_employee_id');
        const session = localStorage.getItem('ds_employee_session');
        
        if (token && (empId || session)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('ds_employee_token');
          localStorage.removeItem('ds_current_employee_id');
          localStorage.removeItem('ds_employee_session');
        }
      } catch (error) {
        console.error('Employee session check failed', error);
        setIsAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-semibold tracking-wide">Securing employee session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Strictly redirect to Employee Login if not authenticated
    return <Navigate to="/employee/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
