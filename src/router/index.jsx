import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLogin from '../pages/auth/AdminLogin';
import EmployeeLogin from '../pages/auth/EmployeeLogin';
import AccountActivation from '../pages/auth/AccountActivation';
import AdminLayout from '../layouts/AdminLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import AdminProtectedRoute from '../components/auth/AdminProtectedRoute';
import EmployeeProtectedRoute from '../components/auth/EmployeeProtectedRoute';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import Employees from '../pages/admin/Employees';
import AddEmployee from '../pages/admin/AddEmployee';

// Onboarding Module Pages
import Onboarding from '../pages/admin/Onboarding';
import PendingOnboarding from '../pages/admin/PendingOnboarding';
import CreateJobOffer from '../pages/admin/CreateJobOffer';
import OfferLetters from '../pages/admin/OfferLetters';
import OnboardingDetail from '../pages/admin/OnboardingDetail';
import TemplateManager from '../pages/admin/TemplateManager';
import EmailHistory from '../pages/admin/EmailHistory';

import WorkManagement from '../pages/admin/WorkManagement';
import Attendance from '../pages/admin/Attendance';
import Reports from '../pages/admin/Reports';
import AdminNotifications from '../pages/admin/Notifications';
import Settings from '../pages/admin/Settings';

// Employee Pages
import EmployeeDashboard from '../pages/employee/Dashboard';
import EmployeeProfile from '../pages/employee/Profile';
import MyWork from '../pages/employee/MyWork';
import EmployeeAttendance from '../pages/employee/Attendance';
import Documents from '../pages/employee/Documents';
import EmployeeNotifications from '../pages/employee/Notifications';
import EmployeeSettings from '../pages/employee/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin/login" replace />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/employee/login',
    element: <EmployeeLogin />,
  },
  {
    path: '/activate-account',
    element: <AccountActivation />,
  },

  // ── Admin Portal (ALL routes protected) ──────────────────────
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'employees', element: <Employees /> },
      { path: 'employees/add', element: <AddEmployee /> },

      // Onboarding routes
      { path: 'onboarding', element: <Onboarding /> },
      { path: 'onboarding/pending', element: <PendingOnboarding /> },
      { path: 'onboarding/create', element: <CreateJobOffer /> },
      { path: 'onboarding/templates', element: <TemplateManager /> },
      { path: 'onboarding/email-history', element: <EmailHistory /> },
      { path: 'onboarding/:id', element: <OnboardingDetail /> },

      // Offers routes
      { path: 'offers', element: <OfferLetters /> },
      { path: 'offers/create', element: <CreateJobOffer /> },
      { path: 'offers/:id', element: <OnboardingDetail /> },

      { path: 'work', element: <WorkManagement /> },
      { path: 'attendance', element: <Attendance /> },
      { path: 'reports', element: <Reports /> },
      { path: 'notifications', element: <AdminNotifications /> },
      { path: 'settings', element: <Settings /> },
    ],
  },

  // ── Employee Portal (ALL routes protected) ───────────────────
  {
    path: '/employee',
    element: (
      <EmployeeProtectedRoute>
        <EmployeeLayout />
      </EmployeeProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/employee/dashboard" replace /> },
      { path: 'dashboard', element: <EmployeeDashboard /> },
      { path: 'profile', element: <EmployeeProfile /> },
      { path: 'work', element: <MyWork /> },
      { path: 'attendance', element: <EmployeeAttendance /> },
      { path: 'documents', element: <Documents /> },
      { path: 'notifications', element: <EmployeeNotifications /> },
      { path: 'settings', element: <EmployeeSettings /> },
    ],
  },
]);

export default router;
