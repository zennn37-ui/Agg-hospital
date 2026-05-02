import React, { useState } from 'react';
import { Bell, Search, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const ROLE_META = {
  patient:      '#05bfdb',
  doctor:       '#00d4aa',
  admin:        '#c9a84c',
  nurse:        '#e879f9',
  receptionist: '#fb923c',
  pharmacist:   '#60a5fa',
};

export default function Topbar({ title }) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'Appointment confirmed for tomorrow', time: '2h ago', unread: true },
    { id: 2, text: 'Your lab results are ready', time: '4h ago', unread: true },
    { id: 3, text: 'Prescription renewal reminder', time: '1d ago', unread: false },
  ]);
  const unread = notifications.filter(n => n.unread).length;
  const accent = ROLE_META[user?.role] || '#05bfdb';

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 8px rgba(10,77,104,0.06)',
    }}>
      <div>
        <h1 style={{ fontSize: 19, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 700 }}>{title}</h1>
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div className="search-bar" style={{ width: 230 }}>
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search..." />
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotif(v => !v)} style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <Bell size={17} color="var(--text-secondary)" />
            {unread > 0 && <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%', border: '1.5px solid #fff' }} />}
          </button>
          {showNotif && (
            <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: 300, zIndex: 200, animation: 'fadeIn 0.2s ease' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color="var(--text-muted)" /></button>
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '13px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 10, alignItems: 'flex-start', background: n.unread ? '#f8fbff' : '#fff', cursor: 'pointer' }}>
                  {n.unread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 5 }} />}
                  <div style={{ flex: 1, paddingLeft: n.unread ? 0 : 15 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.text}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{n.time}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px', textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: accent, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* User chip */}
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 12px', background: 'var(--bg)', borderRadius: 10, border: '1.5px solid var(--border)', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, #0a4d68)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0]}</span>
          <ChevronDown size={13} color="var(--text-muted)" />
        </Link>
      </div>
    </header>
  );
}
