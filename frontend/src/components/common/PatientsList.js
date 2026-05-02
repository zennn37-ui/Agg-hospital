import React, { useState, useEffect } from 'react';
import { Search, User, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import MedicalHistory from '../patient/MedicalHistory';

export default function PatientsList() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users?role=patient')
      .then(r => setPatients(r.data.data || []))
      .catch(() => setError('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  if (selected) return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm">← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
            {selected.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)' }}>{selected.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {selected.patientInfo?.bloodGroup && `Blood: ${selected.patientInfo.bloodGroup} · `}
              {selected.phone || selected.email}
            </p>
          </div>
        </div>
      </div>
      <MedicalHistory />
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 12, marginBottom: 22, alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..." />
        </div>
        <button className="btn btn-ghost"><Filter size={14} /> Filter</button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total Patients', value: patients.length, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'With Allergies', value: patients.filter(p => p.patientInfo?.allergies?.length).length, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Chronic Conditions', value: patients.filter(p => p.patientInfo?.chronicConditions?.length).length, color: '#8b5cf6', bg: '#ede9fe' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color={s.color} />
            </div>
            <div><div style={{ fontSize: 22, fontWeight: 700 }}>{loading ? '…' : s.value}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Patient Records ({filtered.length})</h2>
        </div>
        {loading ? <div style={{ padding: 20 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8, marginBottom: 8 }} />)}</div>
          : filtered.length === 0 ? <div className="empty-state"><h3>No patients found</h3></div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Patient</th><th>Blood Group</th><th>Phone</th><th>Conditions</th><th>Allergies</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {p.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.patientInfo?.bloodGroup ? <span className="badge badge-red" style={{ fontSize: 10.5 }}>{p.patientInfo.bloodGroup}</span> : '—'}</td>
                      <td style={{ fontSize: 13 }}>{p.phone || '—'}</td>
                      <td>{p.patientInfo?.chronicConditions?.map((c, i) => <span key={i} className="badge badge-orange" style={{ fontSize: 10, marginRight: 4 }}>{c}</span>) || '—'}</td>
                      <td>{p.patientInfo?.allergies?.map((a, i) => <span key={i} className="badge badge-red" style={{ fontSize: 10, marginRight: 4 }}>{a}</span>) || '—'}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelected(p)}>View Records</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}
