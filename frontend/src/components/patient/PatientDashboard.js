import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Pill, Activity, FileText, Heart, Clock, AlertCircle, Brain, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments?limit=3'),
      api.get('/records'),
    ]).then(([aptRes, recRes]) => {
      setAppointments(aptRes.data.data || []);
      setRecords(recRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const info = user?.patientInfo || {};
  const age = info.dateOfBirth ? new Date().getFullYear() - new Date(info.dateOfBirth).getFullYear() : 'N/A';

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 60%, var(--accent) 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -50, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4 }}>Welcome back,</p>
            <h2 style={{ color: '#fff', fontSize: 28, fontFamily: 'var(--font-display)', marginBottom: 12 }}>{user?.name}</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: `🩸 ${info.bloodGroup || 'N/A'}` },
                { label: `Age: ${age}` },
                { label: `ID: ${user?._id?.slice(-6).toUpperCase()}` },
                ...(info.chronicConditions?.map(c => ({ label: c })) || []),
              ].map((item, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, backdropFilter: 'blur(4px)' }}>{item.label}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginBottom: 2 }}>Next Appointment</div>
            {appointments[0] ? (
              <>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{new Date(appointments[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{appointments[0].time} · {appointments[0].department}</div>
              </>
            ) : <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No upcoming</div>}
          </div>
        </div>
      </div>

      {/* AI Feature Banner */}
      <Link to="/ai-assistant" style={{
        display: 'flex', alignItems: 'center', gap: 16, background: '#0d1b2a', border: '1px solid rgba(5,191,219,0.3)', borderRadius: 14, padding: '18px 24px', marginBottom: 24, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(5,191,219,0.6)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(5,191,219,0.3)'}
      >
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 200, background: 'linear-gradient(to left, rgba(5,191,219,0.07), transparent)' }} />
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(5,191,219,0.2)', border: '1px solid rgba(5,191,219,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Brain size={24} color="#05bfdb" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>AI Health Assistant</span>
            <span style={{ background: 'linear-gradient(135deg, #05bfdb, #00d4aa)', color: '#fff', fontSize: 9.5, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>LIVE</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Ask about your symptoms, medications, or get personalized health insights powered by AI</p>
        </div>
        <span style={{ color: '#05bfdb', fontSize: 22 }}>→</span>
      </Link>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Visits', value: appointments.length || 0, icon: Calendar, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Active Medications', value: records.reduce((acc, r) => acc + (r.medications?.length || 0), 0), icon: Pill, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Medical Records', value: records.length, icon: FileText, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Upcoming', value: appointments.filter(a => a.status === 'confirmed').length, icon: Heart, color: '#ef4444', bg: '#fee2e2' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-info"><h3>{loading ? '...' : s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Upcoming Appointments */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/appointments" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {loading ? <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>{[1,2].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)}</div>
            : appointments.length === 0
              ? <div className="empty-state"><div className="empty-state-icon"><Calendar size={28} color="var(--primary)" /></div><h3>No appointments</h3><p>Book your first appointment with a doctor</p></div>
              : appointments.map(apt => (
                <div key={apt._id} style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={19} color="#3b82f6" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{apt.doctor?.name || 'Doctor'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{apt.department} · {apt.type}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Clock size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{new Date(apt.date).toLocaleDateString()} at {apt.time}</span>
                    </div>
                  </div>
                  <span className={`badge badge-${apt.status === 'confirmed' ? 'green' : apt.status === 'cancelled' ? 'red' : 'yellow'}`}>{apt.status}</span>
                </div>
              ))
          }
        </div>

        {/* Recent Medical Records */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-header">
            <h2>Recent Diagnoses</h2>
            <Link to="/medical-history" className="btn btn-outline btn-sm">Full History</Link>
          </div>
          {loading ? <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />)}</div>
            : records.length === 0
              ? <div className="empty-state"><div className="empty-state-icon"><FileText size={28} color="var(--primary)" /></div><h3>No records yet</h3><p>Your medical history will appear here</p></div>
              : records.slice(0, 3).map(r => (
                <div key={r._id} style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.diagnosis}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.doctor?.name}</div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {r.medications?.slice(0, 2).map((m, i) => <span key={i} className="badge badge-blue" style={{ fontSize: 10.5 }}>{m.name}</span>)}
                  </div>
                </div>
              ))
          }
        </div>
      </div>

      {/* Allergy / Alert banner */}
      {info.allergies?.length > 0 && (
        <div className="alert alert-warning" style={{ marginTop: 20 }}>
          <AlertCircle size={17} color="#92400e" />
          <p><strong>Known Allergies:</strong> {info.allergies.join(', ')} — Please inform your doctor before any new prescription.</p>
        </div>
      )}
    </div>
  );
}
