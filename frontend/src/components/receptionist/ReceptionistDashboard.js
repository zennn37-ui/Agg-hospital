import React, { useState, useEffect } from 'react';
import { Calendar, UserPlus, CreditCard, Bed, AlertTriangle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const BEDS = [
  { ward: 'Ward A', total: 30, occupied: 24 },
  { ward: 'Ward B', total: 40, occupied: 31 },
  { ward: 'ICU', total: 10, occupied: 9 },
  { ward: 'Pediatrics', total: 20, occupied: 12 },
];

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/stats'),
      api.get('/appointments?limit=6'),
    ]).then(([sRes, aRes]) => {
      setStats(sRes.data.data);
      setAppointments(aRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <div style={{ background: 'linear-gradient(135deg, #431407, #9a3412, #fb923c)', borderRadius: 20, padding: '24px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <h2 style={{ color: '#fff', fontSize: 22, fontFamily: 'var(--font-display)' }}>Reception Desk</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 3 }}>AGG Hospital · Front Desk Management</p>
        <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
          {[{ val: loading ? '…' : stats?.today ?? 0, label: "Today's Appointments" }, { val: loading ? '…' : stats?.pending ?? 0, label: 'Pending Confirmation' }].map((item, i) => (
            <div key={i} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.14)', borderRadius: 10 }}>
              <div style={{ color: '#fff', fontWeight: 700 }}>{item.val}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'New Patient', icon: UserPlus, color: '#3b82f6', bg: '#dbeafe', to: '/register-patient' },
          { label: 'Book Appointment', icon: Calendar, color: '#00d4aa', bg: '#ccfbf1', to: '/appointments' },
          { label: 'Billing', icon: CreditCard, color: '#f59e0b', bg: '#fef3c7', to: '/billing' },
          { label: 'Bed Status', icon: Bed, color: '#8b5cf6', bg: '#ede9fe', to: '/beds' },
        ].map((a, i) => (
          <Link key={i} to={a.to} style={{
            padding: '18px 16px', borderRadius: 14, border: '1px solid var(--border-light)',
            background: '#fff', display: 'flex', alignItems: 'center', gap: 12,
            textDecoration: 'none', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = a.bg; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 10, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <a.icon size={19} color={a.color} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="two-col">
        {/* Appointments */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2>Today's Appointments</h2>
            <Link to="/appointments" className="btn btn-outline btn-sm">Manage</Link>
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 58, borderRadius: 10, marginBottom: 8 }} />) :
            appointments.length === 0 ? <div className="empty-state" style={{ padding: 20 }}><h3>No appointments today</h3></div> :
            appointments.map(apt => (
              <div key={apt._id} style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{apt.patient?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{apt.doctor?.name} · {apt.department}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{apt.time}</div>
                  <span className={`badge badge-${apt.status === 'confirmed' ? 'green' : apt.status === 'cancelled' ? 'red' : 'yellow'}`} style={{ fontSize: 10 }}>{apt.status}</span>
                </div>
              </div>
            ))
          }
        </div>

        {/* Bed Availability */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header"><h2>Bed Availability</h2></div>
          {BEDS.map((b, i) => {
            const pct = Math.round((b.occupied / b.total) * 100);
            return (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{b.ward}</span>
                  <span style={{ fontSize: 12.5, color: pct >= 90 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {b.occupied}/{b.total} ({pct}%)
                  </span>
                </div>
                <div style={{ height: 8, background: '#f0f4f8', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? 'var(--danger)' : pct >= 75 ? 'var(--warning)' : 'var(--success)', borderRadius: 10, transition: 'width 0.8s ease' }} />
                </div>
                {pct >= 90 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                    <AlertTriangle size={11} color="var(--danger)" />
                    <span style={{ fontSize: 11, color: 'var(--danger)' }}>Critical – notify supervisor</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
