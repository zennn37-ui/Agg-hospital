import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Calendar, Pill } from 'lucide-react';
import api from '../../utils/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE_DATA = [
  { month: 'Oct', revenue: 38.2, expenses: 22.1 }, { month: 'Nov', revenue: 41.5, expenses: 24.3 },
  { month: 'Dec', revenue: 36.8, expenses: 20.8 }, { month: 'Jan', revenue: 45.2, expenses: 26.1 },
  { month: 'Feb', revenue: 42.1, expenses: 24.8 }, { month: 'Mar', revenue: 48.6, expenses: 27.4 },
];
const DEPT_DATA = [
  { name: 'Cardiology', patients: 48, revenue: 12.4 }, { name: 'Endocrinology', patients: 35, revenue: 9.8 },
  { name: 'Neurology', patients: 41, revenue: 13.2 }, { name: 'Orthopedics', patients: 52, revenue: 15.6 },
  { name: 'Pediatrics', patients: 67, revenue: 8.9 },
];
const PATIENT_AGE = [
  { range: '0-18', count: 120 }, { range: '19-35', count: 285 }, { range: '36-50', count: 342 },
  { range: '51-65', count: 289 }, { range: '65+', count: 212 },
];
const VISIT_TYPES = [
  { name: 'New Visit', value: 38, color: '#3b82f6' }, { name: 'Follow-up', value: 45, color: '#00d4aa' },
  { name: 'Emergency', value: 10, color: '#ef4444' }, { name: 'Surgery Consult', value: 7, color: '#f59e0b' },
];

export default function Reports() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/users/admin/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)' }}>Analytics & Reports</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Live hospital performance overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['This Month', 'Last 6 Months', 'This Year'].map((p, i) => (
            <button key={p} className={`btn btn-sm ${i === 1 ? 'btn-primary' : 'btn-ghost'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Patients', value: stats?.totalPatients ?? 0, change: '+12%', icon: Users, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Total Doctors', value: stats?.totalDoctors ?? 0, change: '+2', icon: Users, color: '#00d4aa', bg: '#ccfbf1' },
          { label: "Today's Appointments", value: stats?.todayAppointments ?? 0, change: 'Live', icon: Calendar, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Pending Prescriptions', value: stats?.pendingPrescriptions ?? 0, change: 'Action needed', icon: Pill, color: '#8b5cf6', bg: '#ede9fe' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
              <span style={{ fontSize: 10.5, color: 'var(--success)', fontWeight: 600 }}>{s.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Visit Types */}
      <div className="two-col" style={{ marginBottom: 22 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2>Revenue vs Expenses (₹ Lakhs)</h2>
            <span className="badge badge-green">+14.8% vs last year</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REVENUE_DATA} barSize={22} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#718096' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip formatter={(v, n) => [`₹${v}L`, n === 'revenue' ? 'Revenue' : 'Expenses']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#0a4d68" radius={[4,4,0,0]} name="Revenue" />
              <Bar dataKey="expenses" fill="#88d5e0" radius={[4,4,0,0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header"><h2>Visit Type Distribution</h2></div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={VISIT_TYPES} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {VISIT_TYPES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={v => [`${v}%`]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department performance + Age distribution */}
      <div className="two-col" style={{ marginBottom: 22 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header"><h2>Patients by Department</h2></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEPT_DATA} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#4a5568' }} width={90} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="patients" fill="url(#deptGrad)" radius={[0,4,4,0]} />
              <defs><linearGradient id="deptGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0a4d68" /><stop offset="100%" stopColor="#05bfdb" /></linearGradient></defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header"><h2>Patient Age Distribution</h2></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PATIENT_AGE} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#718096' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#00d4aa" radius={[6,6,0,0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department revenue table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Department Performance Summary</h2>
        </div>
        <table className="data-table">
          <thead><tr><th>Department</th><th>Total Patients</th><th>Revenue (₹ Lakhs)</th><th>Avg per Patient</th><th>Performance</th></tr></thead>
          <tbody>
            {DEPT_DATA.map((d, i) => {
              const avg = ((d.revenue / d.patients) * 100000).toFixed(0);
              const performance = d.patients > 50 ? 'Excellent' : d.patients > 35 ? 'Good' : 'Average';
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.patients}</td>
                  <td>₹{d.revenue}L</td>
                  <td>₹{Number(avg).toLocaleString()}</td>
                  <td><span className={`badge badge-${performance === 'Excellent' ? 'green' : performance === 'Good' ? 'blue' : 'yellow'}`} style={{ fontSize: 11 }}>{performance}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
