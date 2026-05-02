import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Heart, Droplets, Plus, Search, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

export default function VitalsLog() {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/vitals')
      .then(r => setVitals(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = vitals.filter(v =>
    !search || v.patient?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (bp) => {
    if (!bp) return 'unknown';
    const sys = parseInt(bp.split('/')[0]);
    if (sys >= 140) return 'high';
    if (sys >= 120) return 'elevated';
    return 'normal';
  };

  const bpColor = (status) => status === 'high' ? '#ef4444' : status === 'elevated' ? '#f59e0b' : '#00d4aa';
  const bpBg = (status) => status === 'high' ? '#fee2e2' : status === 'elevated' ? '#fef3c7' : '#ccfbf1';

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 12, marginBottom: 22, alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient name…" />
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total Readings', value: vitals.length, icon: Activity, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Today', value: vitals.filter(v => new Date(v.createdAt).toDateString() === new Date().toDateString()).length, icon: TrendingUp, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'High BP Alerts', value: vitals.filter(v => getStatus(v.bloodPressure) === 'high').length, icon: Heart, color: '#ef4444', bg: '#fee2e2' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-info"><h3>{loading ? '…' : s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Vitals Log ({filtered.length})</h2>
        </div>
        {loading ? (
          <div style={{ padding: 20 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 8, marginBottom: 8 }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Activity size={28} color="var(--primary)" /></div><h3>No vitals recorded</h3><p>Log vitals from the patient cards on the dashboard</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Patient</th><th>Blood Pressure</th><th>Pulse</th><th>Temperature</th><th>SpO2</th><th>Weight</th><th>Ward/Bed</th><th>Recorded By</th><th>Date</th></tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const bpStatus = getStatus(v.bloodPressure);
                  return (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 600 }}>{v.patient?.name || '—'}</td>
                      <td>
                        {v.bloodPressure ? (
                          <span className="badge" style={{ background: bpBg(bpStatus), color: bpColor(bpStatus), fontSize: 12 }}>
                            <Heart size={11} /> {v.bloodPressure}
                          </span>
                        ) : '—'}
                      </td>
                      <td>{v.pulse ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><Activity size={11} color="#ef4444" />{v.pulse} bpm</span> : '—'}</td>
                      <td>{v.temperature ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><Thermometer size={11} color="#f59e0b" />{v.temperature}</span> : '—'}</td>
                      <td>{v.spo2 ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><Droplets size={11} color="#3b82f6" />{v.spo2}</span> : '—'}</td>
                      <td style={{ fontSize: 13 }}>{v.weight || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.ward || '—'}{v.bed ? ` · ${v.bed}` : ''}</td>
                      <td style={{ fontSize: 12 }}>{v.recordedBy?.name || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(v.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
