import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Stethoscope, Bed, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const REVENUE = [
  { month: 'Oct', revenue: 38 }, { month: 'Nov', revenue: 41 }, { month: 'Dec', revenue: 36 },
  { month: 'Jan', revenue: 45 }, { month: 'Feb', revenue: 42 }, { month: 'Mar', revenue: 48 },
];
const DEPTS = [
  { name: 'Cardiology', load: 90, color: '#ef4444' }, { name: 'Neurology', load: 82, color: '#8b5cf6' },
  { name: 'Endocrinology', load: 70, color: '#f59e0b' }, { name: 'Pediatrics', load: 65, color: '#00d4aa' },
  { name: 'Orthopedics', load: 55, color: '#3b82f6' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/admin/stats'),
      api.get('/users?role=patient&limit=5'),
    ]).then(([sRes, pRes]) => {
      setStats(sRes.data.data);
      setRecentPatients(pRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1200, #3d2c00, #c9a84c)', borderRadius: 20, padding: '26px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <h2 style={{ color: '#fff', fontSize: 24, fontFamily: 'var(--font-display)' }}>Hospital Administration</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>AGG Hospital · Real-time Overview</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          {[{ val: loading ? '…' : `${stats?.todayAppointments ?? 0}`, label: "Today's Appointments" }, { val: loading ? '…' : `${stats?.pendingPrescriptions ?? 0}`, label: 'Pending Prescriptions' }].map((item, i) => (
            <div key={i} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.12)', borderRadius: 10 }}>
              <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 18 }}>{item.val}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: Users, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Total Doctors', value: stats?.totalDoctors ?? 0, icon: Stethoscope, color: '#00d4aa', bg: '#ccfbf1' },
          { label: 'Total Staff', value: stats?.totalStaff ?? 0, icon: Users, color: '#c9a84c', bg: '#fef9e7' },
          { label: "Today's Appointments", value: stats?.todayAppointments ?? 0, icon: Calendar, color: '#8b5cf6', bg: '#ede9fe' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-info"><h3>{loading ? '…' : s.value.toLocaleString()}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: 22 }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2>Monthly Revenue (₹ Lakhs)</h2>
            <span className="badge badge-green">↑ 14.8%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#718096' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip formatter={v => [`₹${v}L`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="url(#revGrad)" radius={[6,6,0,0]} />
              <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a4d68" /><stop offset="100%" stopColor="#088395" /></linearGradient></defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Load */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header"><h2>Department Load</h2></div>
          {DEPTS.map((d, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: d.load > 85 ? '#ef4444' : 'var(--text-primary)' }}>{d.load}%</span>
              </div>
              <div style={{ height: 7, background: '#f0f4f8', borderRadius: 10 }}>
                <div style={{ height: '100%', width: `${d.load}%`, background: d.color, borderRadius: 10, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="two-col">
        {/* Recent Patients */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2>Recent Patients</h2>
            <Link to="/patients" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8, marginBottom: 8 }} />) : (
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Blood</th><th>Phone</th></tr></thead>
              <tbody>
                {recentPatients.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td><span className="badge badge-red" style={{ fontSize: 10.5 }}>{p.patientInfo?.bloodGroup || 'N/A'}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Alerts */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header"><h2>System Alerts</h2></div>
          {[
            { type: 'danger', msg: 'ICU Bed capacity critical (90%)', time: '5 min ago' },
            { type: 'warning', msg: `${stats?.pendingPrescriptions ?? 0} prescriptions pending dispense`, time: '1 hr ago' },
            { type: 'success', msg: 'Lab system backup completed', time: '2 hr ago' },
            { type: 'warning', msg: 'Low stock alert: 3 medications', time: '3 hr ago' },
          ].map((a, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, background: a.type === 'danger' ? '#fee2e2' : a.type === 'warning' ? '#fef3c7' : '#d1fae5', border: `1px solid ${a.type === 'danger' ? '#fca5a5' : a.type === 'warning' ? '#fcd34d' : '#6ee7b7'}` }}>
              {a.type === 'success' ? <CheckCircle size={15} color="#065f46" style={{ marginTop: 1 }} /> : <AlertTriangle size={15} color={a.type === 'danger' ? '#991b1b' : '#92400e'} style={{ marginTop: 1 }} />}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: a.type === 'danger' ? '#7f1d1d' : a.type === 'warning' ? '#78350f' : '#064e3b' }}>{a.msg}</p>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
