import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, Pill, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/stats'),
      api.get('/appointments?limit=5'),
      api.get('/users?role=patient&limit=5'),
    ]).then(([sRes, aRes, pRes]) => {
      setStats(sRes.data.data);
      setAppointments(aRes.data.data || []);
      setPatients(pRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statusColor = (s) => s === 'confirmed' ? 'green' : s === 'cancelled' ? 'red' : 'yellow';

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46, #00d4aa)', borderRadius: 20, padding: '26px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <h2 style={{ color: '#fff', fontSize: 24, fontFamily: 'var(--font-display)', marginBottom: 4 }}>Good day, {user?.name}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{user?.doctorInfo?.specialization || 'Doctor'} · {user?.doctorInfo?.experience || 0} years experience</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: "Today's Appointments", val: loading ? '…' : stats?.today ?? 0 },
            { label: 'Total Patients', val: loading ? '…' : user?.doctorInfo?.totalPatients ?? 0 },
            { label: 'Rating', val: `${user?.doctorInfo?.rating ?? 'N/A'} ⭐` },
            { label: 'Pending Reviews', val: loading ? '…' : stats?.pending ?? 0 },
          ].map((item, i) => (
            <div key={i} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.14)', borderRadius: 10, backdropFilter: 'blur(8px)' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{item.val}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: "Today's Appointments", value: stats?.today ?? 0, icon: Calendar, color: '#00d4aa', bg: '#ccfbf1' },
          { label: 'Pending Confirmation', value: stats?.pending ?? 0, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Confirmed Today', value: stats?.confirmed ?? 0, icon: FileText, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Qualification', value: user?.doctorInfo?.qualification?.split(',')[0] || 'MBBS', icon: Pill, color: '#8b5cf6', bg: '#ede9fe' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-info"><h3 style={{ fontSize: typeof s.value === 'string' ? 14 : 26 }}>{loading ? '…' : s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Appointments */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2>Recent Appointments</h2>
            <Link to="/appointments" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 62, borderRadius: 10, marginBottom: 8 }} />) :
            appointments.length === 0 ? <div className="empty-state" style={{ padding: 20 }}><h3>No appointments yet</h3></div> :
            appointments.map(apt => (
              <div key={apt._id} style={{ padding: '13px 14px', background: 'var(--bg)', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 9, borderLeft: `3px solid ${apt.status === 'confirmed' ? 'var(--accent-warm)' : apt.status === 'cancelled' ? 'var(--danger)' : 'var(--warning)'}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{apt.patient?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{apt.type} · {apt.department}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{apt.time}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(apt.date).toLocaleDateString()}</div>
                </div>
                <span className={`badge badge-${statusColor(apt.status)}`} style={{ fontSize: 10 }}>{apt.status}</span>
              </div>
            ))
          }
        </div>

        {/* Patients */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2>Patients</h2>
            <Link to="/patients" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 54, borderRadius: 10, marginBottom: 8 }} />) :
            patients.map(p => (
              <div key={p._id} style={{ padding: '11px 14px', background: 'var(--bg)', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {p.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.patientInfo?.bloodGroup || 'N/A'} · {p.phone || 'No phone'}</div>
                </div>
                <Link to="/patients" className="btn btn-outline btn-sm">Records</Link>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
