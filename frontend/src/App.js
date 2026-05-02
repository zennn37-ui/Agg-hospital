import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Sidebar from './components/common/Sidebar';
import Topbar from './components/common/Topbar';
import Appointments from './components/common/Appointments';
import Prescriptions from './components/common/Prescriptions';
import PatientsList from './components/common/PatientsList';
import ProfilePage from './components/common/ProfilePage';
import PatientDashboard from './components/patient/PatientDashboard';
import MedicalHistory from './components/patient/MedicalHistory';
import AIAssistant from './components/patient/AIAssistant';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import StaffManagement from './components/admin/StaffManagement';
import Reports from './components/admin/Reports';
import NurseDashboard from './components/nurse/NurseDashboard';
import VitalsLog from './components/nurse/VitalsLog';
import ReceptionistDashboard from './components/receptionist/ReceptionistDashboard';
import BillingPage from './components/receptionist/BillingPage';
import BedManagement from './components/receptionist/BedManagement';
import PharmacistDashboard from './components/pharmacist/PharmacistDashboard';
import PharmacyAlerts from './components/pharmacist/PharmacyAlerts';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard', '/appointments': 'Appointments', '/medical-history': 'Medical History',
  '/ai-assistant': 'AI Health Assistant', '/prescriptions': 'Prescriptions', '/patients': 'Patients',
  '/staff': 'Staff Management', '/profile': 'My Profile', '/inventory': 'Drug Inventory',
  '/vitals': 'Vitals Log', '/reports': 'Reports & Analytics', '/settings': 'Settings',
  '/register-patient': 'Register Patient', '/billing': 'Billing', '/beds': 'Bed Management',
  '/dispense': 'Dispense Log', '/alerts': 'Pharmacy Alerts', '/schedule': 'Shift Schedule',
};

function PlaceholderPage({ icon = '🏗️', title = 'Coming Soon', msg = 'This section is under development.' }) {
  return (
    <div className="empty-state" style={{ minHeight: 420 }}>
      <div className="empty-state-icon" style={{ fontSize: 36, background: 'var(--primary-lighter)' }}>{icon}</div>
      <h3>{title}</h3>
      <p>{msg}</p>
    </div>
  );
}

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading AGG Hospital…</p>
    </div>
  );
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

function RoleRoute({ element, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="empty-state" style={{ minHeight: 420 }}>
        <div className="empty-state-icon">🔒</div>
        <h3>Access Denied</h3>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }
  return element;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  const map = {
    patient: <PatientDashboard />,
    doctor: <DoctorDashboard />,
    admin: <AdminDashboard />,
    nurse: <NurseDashboard />,
    receptionist: <ReceptionistDashboard />,
    pharmacist: <PharmacistDashboard />,
  };
  return map[user.role] || <AdminDashboard />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedLayout><DashboardRouter /></ProtectedLayout>} />
      <Route path="/appointments" element={<ProtectedLayout><Appointments /></ProtectedLayout>} />
      <Route path="/prescriptions" element={<ProtectedLayout><Prescriptions /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />

      {/* Patient */}
      <Route path="/medical-history" element={<ProtectedLayout><RoleRoute element={<MedicalHistory />} allowedRoles={['patient','doctor','nurse','admin']} /></ProtectedLayout>} />
      <Route path="/ai-assistant" element={<ProtectedLayout><RoleRoute element={<AIAssistant />} allowedRoles={['patient']} /></ProtectedLayout>} />

      {/* Doctor + Admin + Nurse */}
      <Route path="/patients" element={<ProtectedLayout><RoleRoute element={<PatientsList />} allowedRoles={['doctor','admin','nurse','receptionist']} /></ProtectedLayout>} />

      {/* Admin */}
      <Route path="/staff" element={<ProtectedLayout><RoleRoute element={<StaffManagement />} allowedRoles={['admin']} /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><RoleRoute element={<Reports />} allowedRoles={['admin']} /></ProtectedLayout>} />

      {/* Nurse */}
      <Route path="/vitals" element={<ProtectedLayout><RoleRoute element={<VitalsLog />} allowedRoles={['nurse','admin','doctor']} /></ProtectedLayout>} />
      <Route path="/schedule" element={<ProtectedLayout><RoleRoute element={<PlaceholderPage icon="📅" title="Shift Schedule" msg="Nurse shift scheduling coming soon." />} allowedRoles={['nurse']} /></ProtectedLayout>} />

      {/* Receptionist */}
      <Route path="/register-patient" element={<ProtectedLayout><RoleRoute element={<PlaceholderPage icon="👤" title="Patient Registration" msg="Use the registration form on the Dashboard quick action." />} allowedRoles={['receptionist','admin']} /></ProtectedLayout>} />
      <Route path="/billing" element={<ProtectedLayout><RoleRoute element={<BillingPage />} allowedRoles={['receptionist','admin','patient']} /></ProtectedLayout>} />
      <Route path="/beds" element={<ProtectedLayout><RoleRoute element={<BedManagement />} allowedRoles={['receptionist','admin','nurse']} /></ProtectedLayout>} />

      {/* Pharmacist */}
      <Route path="/inventory" element={<ProtectedLayout><RoleRoute element={<PharmacistDashboard />} allowedRoles={['pharmacist','admin']} /></ProtectedLayout>} />
      <Route path="/dispense" element={<ProtectedLayout><RoleRoute element={<PharmacistDashboard />} allowedRoles={['pharmacist']} /></ProtectedLayout>} />
      <Route path="/alerts" element={<ProtectedLayout><RoleRoute element={<PharmacyAlerts />} allowedRoles={['pharmacist','admin']} /></ProtectedLayout>} />

      <Route path="*" element={<ProtectedLayout><PlaceholderPage icon="404" title="Page Not Found" msg="This page doesn't exist." /></ProtectedLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
