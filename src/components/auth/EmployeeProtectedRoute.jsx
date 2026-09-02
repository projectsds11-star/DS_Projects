import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { liveDataService } from '../../services/liveDataService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

export default function EmployeeProtectedRoute({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('ds_employee_token');
        const empId = localStorage.getItem('ds_current_employee_id');
        const session = localStorage.getItem('ds_employee_session');
        
        if (token && (empId || session)) {
          // Check if employee is inactive in the live database
          const targetId = empId || (session ? JSON.parse(session).employeeId : null);
          if (targetId) {
            let emp = null;
            if (isSupabaseConfigured) {
              try {
                const { data } = await supabase
                  .from('employees')
                  .select('status')
                  .eq('employee_id', targetId)
                  .maybeSingle();
                if (data) emp = data;
              } catch (e) {
                console.warn('Status verification error:', e);
              }
            }
            if (!emp) {
              emp = await liveDataService.getEmployeeById(targetId);
            }

            if (emp && emp.status === 'Inactive') {
              if (isMounted) {
                setIsDeactivated(true);
                setIsAuthenticated(false);
                localStorage.removeItem('ds_employee_token');
                localStorage.removeItem('ds_current_employee_id');
                localStorage.removeItem('ds_employee_session');
              }
              return;
            }
          }

          if (isMounted) setIsAuthenticated(true);
        } else {
          if (isMounted) {
            setIsAuthenticated(false);
            localStorage.removeItem('ds_employee_token');
            localStorage.removeItem('ds_current_employee_id');
            localStorage.removeItem('ds_employee_session');
          }
        }
      } catch (error) {
        console.error('Employee session check failed', error);
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    checkSession();
    return () => { isMounted = false; };
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

  if (isDeactivated) {
    return <Navigate to="/employee/login?error=deactivated" replace />;
  }

  if (!isAuthenticated) {
    // Strictly redirect to Employee Login if not authenticated
    return <Navigate to="/employee/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

