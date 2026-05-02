import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, FileText, User, Calendar, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const isPharmacist = user?.role === 'pharmacist';
  const isDoctor = user?.role === 'doctor';

  useEffect(() => { fetchPrescriptions(); }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try { const res = await api.get('/prescriptions'); setPrescriptions(res.data.data || []); }
    catch { setError('Failed to load prescriptions'); }
    finally { setLoading(false); }
  };

  const handleDispense = async (id) => {
    try { await api.put(`/prescriptions/${id}/dispense`); fetchPrescriptions(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to dispense'); }
  };

  const filtered = prescriptions.filter(rx => {
    const matchFilter = filter === 'all' || rx.status === filter;
    const matchSearch = !search || rx.patient?.name?.toLowerCase().includes(search.toLowerCase()) || rx.doctor?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusClass = (s) => s === 'dispensed' ? 'badge-green' : s === 'cancelled' ? 'badge-red' : 'badge-yellow';

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 12, marginBottom: 22, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prescriptions..." />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','pending','dispensed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total', value: prescriptions.length, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Pending', value: prescriptions.filter(r => r.status === 'pending').length, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Dispensed', value: prescriptions.filter(r => r.status === 'dispensed').length, color: '#065f46', bg: '#d1fae5' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pill size={20} color={s.color} /></div>
            <div><div style={{ fontSize: 22, fontWeight: 700 }}>{loading ? '—' : s.value}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Prescriptions ({filtered.length})</h2>
        </div>
        {loading ? (
          <div style={{ padding: 24 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 8, marginBottom: 8 }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Pill size={28} color="var(--primary)" /></div><h3>No prescriptions found</h3></div>
        ) : (
          <div>
            {filtered.map(rx => (
              <div key={rx._id} style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Pill size={20} color="#8b5cf6" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <span className={`badge ${statusClass(rx.status)}`} style={{ fontSize: 11 }}>{rx.status}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} /> {rx.patient?.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={11} /> {rx.doctor?.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {new Date(rx.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {rx.diagnosis && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8 }}>Diagnosis: {rx.diagnosis}</p>}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {rx.medications?.map((m, i) => (
                      <span key={i} className="badge badge-blue" style={{ fontSize: 11 }}>{m.name} {m.dose} · {m.frequency}</span>
                    ))}
                  </div>
                  {rx.dispensedBy && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Dispensed by {rx.dispensedBy?.name} on {new Date(rx.dispensedAt).toLocaleDateString()}</p>}
                </div>
                <div>
                  {isPharmacist && rx.status === 'pending' && (
                    <button className="btn btn-success btn-sm" onClick={() => handleDispense(rx._id)}>
                      <CheckCircle size={14} /> Dispense
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
