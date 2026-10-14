import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { InstitutionDirectoryPage } from './pages/public/InstitutionDirectoryPage';
import { RegisterInstitutionPage } from './pages/public/RegisterInstitutionPage';
import { UnauthorizedPage, NotFoundPage } from './pages/public/ErrorPages';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitComplaintPage } from './pages/student/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/student/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/student/ComplaintDetailPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AssignedComplaintsPage } from './pages/staff/AssignedComplaintsPage';
import { StaffComplaintDetailPage } from './pages/staff/StaffComplaintDetailPage';
import { StaffStatsPage } from './pages/staff/StaffStatsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllComplaintsPage } from './pages/admin/AllComplaintsPage';
import { CategoryManagementPage } from './pages/admin/CategoryManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { MemberManagementPage } from './pages/admin/MemberManagementPage';
import { InstitutionSettingsPage } from './pages/admin/InstitutionSettingsPage';
import { AnalyticsReportsPage } from './pages/admin/AnalyticsReportsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { PlatformSuperAdminDashboard } from './pages/admin/PlatformSuperAdminDashboard';

// Role-based Route Guard
function ProtectedRoute({ children, allowedRoles, requireSuperAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner text="Checking credentials..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && !user.isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/institutions" element={<InstitutionDirectoryPage />} />
        <Route path="/register-institution" element={<RegisterInstitutionPage />} />

        {/* Auth Layout Pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Student Protected Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/submit-complaint" element={<SubmitComplaintPage />} />
          <Route path="/my-complaints" element={<MyComplaintsPage />} />
          <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="/profile" element={<StudentProfilePage />} />
        </Route>

        {/* Staff Protected Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/complaints" element={<AssignedComplaintsPage />} />
          <Route path="/staff/complaints/:id" element={<StaffComplaintDetailPage />} />
          <Route path="/staff/stats" element={<StaffStatsPage />} />
          <Route path="/staff/profile" element={<StudentProfilePage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AllComplaintsPage />} />
          <Route path="/admin/members" element={<MemberManagementPage />} />
          <Route path="/admin/categories" element={<CategoryManagementPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/institution-settings" element={<InstitutionSettingsPage />} />
          <Route path="/admin/analytics" element={<AnalyticsReportsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>

        {/* Platform Super Admin Protected Routes */}
        <Route
          element={
            <ProtectedRoute requireSuperAdmin={true}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/platform/dashboard" element={<PlatformSuperAdminDashboard />} />
        </Route>

        {/* Error & Fallback Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
