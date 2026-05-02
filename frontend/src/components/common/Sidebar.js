import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Calendar, FileText, Pill, Activity,
  Settings, LogOut, ChevronRight, Heart, Stethoscope, Shield,
  UserCheck, ClipboardList, Package, Bell, Bed, Brain, X, Menu
} from 'lucide-react';

const NAV = {
  patient: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Appointments', icon: Calendar, path: '/appointments' },
    { label: 'Medical History', icon: FileText, path: '/medical-history' },
    { label: 'AI Health Assistant', icon: Brain, path: '/ai-assistant', badge: 'AI' },
    { label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
    { label: 'Profile', icon: Settings, path: '/profile' },
  ],
  doctor: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Patients', icon: Users, path: '/patients' },
    { label: 'Appointments', icon: Calendar, path: '/appointments' },
    { label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
    { label: 'Medical Records', icon: FileText, path: '/medical-history' },
    { label: 'Profile', icon: Settings, path: '/profile' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Staff Management', icon: Users, path: '/staff' },
    { label: 'Patients', icon: Bed, path: '/patients' },
    { label: 'Appointments', icon: Calendar, path: '/appointments' },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ],
  nurse: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Patients', icon: Users, path: '/patients' },
    { label: 'Vitals Log', icon: Activity, path: '/vitals' },
    { label: 'Medications', icon: Pill, path: '/prescriptions' },
    { label: 'Schedule', icon: Calendar, path: '/appointments' },
  ],
  receptionist: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Appointments', icon: Calendar, path: '/appointments' },
    { label: 'Patient Registration', icon: UserCheck, path: '/register-patient' },
    { label: 'Billing', icon: ClipboardList, path: '/billing' },
    { label: 'Bed Availability', icon: Bed, path: '/beds' },
  ],
  pharmacist: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Prescriptions', icon: FileText, path: '/prescriptions' },
    { label: 'Inventory', icon: Package, path: '/inventory' },
    { label: 'Dispense Log', icon: ClipboardList, path: '/dispense' },
    { label: 'Alerts', icon: Bell, path: '/alerts' },
  ],
};

const ROLE_META = {
  patient:      { accent: '#05bfdb', label: 'Patient', icon: Heart },
  doctor:       { accent: '#00d4aa', label: 'Doctor', icon: Stethoscope },
  admin:        { accent: '#c9a84c', label: 'Administrator', icon: Shield },
  nurse:        { accent: '#e879f9', label: 'Nurse', icon: Activity },
  receptionist: { accent: '#fb923c', label: 'Receptionist', icon: UserCheck },
  pharmacist:   { accent: '#60a5fa', label: 'Pharmacist', icon: Pill },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  if (!user) return null;

  const nav = NAV[user.role] || [];
  const meta = ROLE_META[user.role];
  const RoleIcon = meta.icon;

  return (
    <aside style={{
      width: collapsed ? 72 : 'var(--sidebar-width)',
      background: 'var(--bg-sidebar)',
      position: 'fixed', top: 0, left: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      zIndex: 100, transition: 'width 0.25s ease',
      overflow: 'hidden',
      boxShadow: '2px 0 20px rgba(0,0,0,0.3)',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 72 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${meta.accent}, #0a4d68)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Heart size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 17, fontWeight: 700, whiteSpace: 'nowrap' }}>AGG Hospital</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' }}>Healthcare System</div>
          </div>
        )}
        <button onClick={() => setCollapsed(v => !v)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
          <Menu size={16} />
        </button>
      </div>

      {/* User */}
      {!collapsed && (
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${meta.accent}30`, border: `2px solid ${meta.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.accent, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${meta.accent}22`, borderRadius: 20, padding: '1px 8px', marginTop: 2 }}>
                <RoleIcon size={9} color={meta.accent} />
                <span style={{ color: meta.accent, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>{meta.label}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 10px' }}>
        {!collapsed && <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.25)', letterSpacing: 1.4, textTransform: 'uppercase', padding: '8px 8px 6px', fontWeight: 600 }}>Menu</div>}
        {nav.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} title={collapsed ? item.label : ''} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '11px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10, marginBottom: 2, transition: 'all 0.15s',
              background: isActive ? `${meta.accent}20` : 'transparent',
              color: isActive ? meta.accent : 'rgba(255,255,255,0.58)',
              fontWeight: isActive ? 600 : 400, fontSize: 13.5,
              borderLeft: isActive && !collapsed ? `3px solid ${meta.accent}` : '3px solid transparent',
              textDecoration: 'none',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isActive ? meta.accent : 'rgba(255,255,255,0.58)'; }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {!collapsed && item.badge && <span style={{ background: `linear-gradient(135deg, ${meta.accent}, #00d4aa)`, color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>{item.badge}</span>}
              {!collapsed && isActive && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={logout} title={collapsed ? 'Sign Out' : ''} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '10px 0' : '10px 12px', borderRadius: 10, border: 'none',
          background: 'rgba(230,57,70,0.1)', color: '#f87171', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,57,70,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(230,57,70,0.1)'}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
