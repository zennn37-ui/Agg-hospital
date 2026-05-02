import React, { useState, useEffect } from 'react';
import { Bed, User, Plus, AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

function AssignModal({ bed, patients, onClose, onAssign, loading }) {
  const [patientId, setPatientId] = useState('');
  const [discharge, setDischarge] = useState('');
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Bed {bed.bedNumber}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '12px 14px', background: 'var(--primary-lighter)', borderRadius: 10, marginBottom: 18, fontSize: 13, color: 'var(--primary)' }}>
          🏥 Ward: <strong>{bed.ward}</strong> · Type: <strong>{bed.type}</strong> · ₹{bed.pricePerDay}/day
        </div>
        <div className="form-group">
          <label className="form-label">Select Patient *</label>
          <select className="form-control" value={patientId} onChange={e => setPatientId(e.target.value)}>
            <option value="">Choose patient</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name} – {p.patientInfo?.bloodGroup || 'N/A'}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Expected Discharge Date</label>
          <input type="date" className="form-control" min={new Date().toISOString().split('T')[0]} value={discharge} onChange={e => setDischarge(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" disabled={loading || !patientId} onClick={() => onAssign(bed._id, patientId, discharge)}>{loading ? 'Assigning…' : 'Assign Bed'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function BedManagement() {
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wardFilter, setWardFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignBed, setAssignBed] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    api.get('/users?role=patient').then(r => setPatients(r.data.data || [])).catch(() => {});
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bedsRes, statsRes] = await Promise.all([api.get('/beds'), api.get('/beds/stats')]);
      setBeds(bedsRes.data.data || []);
      setStats(statsRes.data.data || []);
    } catch { setError('Failed to load bed data'); }
    finally { setLoading(false); }
  };

  const handleAssign = async (bedId, patientId, discharge) => {
    setAssigning(true);
    try { await api.put(`/beds/${bedId}/assign`, { patientId, expectedDischarge: discharge || undefined }); setAssignBed(null); fetchData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to assign'); }
    finally { setAssigning(false); }
  };

  const handleRelease = async (bedId) => {
    if (!window.confirm('Release this bed?')) return;
    try { await api.put(`/beds/${bedId}/release`); fetchData(); }
    catch { setError('Failed to release bed'); }
  };

  const wards = ['all', ...new Set(beds.map(b => b.ward))];
  const filtered = beds.filter(b => {
    return (wardFilter === 'all' || b.ward === wardFilter) && (statusFilter === 'all' || b.status === statusFilter);
  });

  const statusColor = s => s === 'available' ? '#065f46' : s === 'occupied' ? '#991b1b' : s === 'maintenance' ? '#92400e' : '#1d4ed8';
  const statusBg = s => s === 'available' ? '#d1fae5' : s === 'occupied' ? '#fee2e2' : s === 'maintenance' ? '#fef3c7' : '#dbeafe';

  return (
    <div className="fade-in">
      {assignBed && <AssignModal bed={assignBed} patients={patients} onClose={() => setAssignBed(null)} onAssign={handleAssign} loading={assigning} />}

      {/* Ward Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map((ward, i) => {
          const pct = ward.total > 0 ? Math.round((ward.occupied / ward.total) * 100) : 0;
          return (
            <div key={i} className="card" style={{ padding: '16px 18px', cursor: 'pointer', border: wardFilter === ward.ward ? '2px solid var(--primary)' : '1px solid var(--border-light)' }} onClick={() => setWardFilter(wardFilter === ward.ward ? 'all' : ward.ward)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>{ward.ward}</h3>
                <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warning)' : 'var(--success)' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: '#f0f4f8', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warning)' : 'var(--success)', borderRadius: 10, transition: 'width 0.8s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ward.occupied}/{ward.total} occupied</span>
                <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>{ward.available} free</span>
              </div>
              {pct >= 90 && <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}><AlertTriangle size={11} color="var(--danger)" /><span style={{ fontSize: 10, color: 'var(--danger)' }}>Critical capacity</span></div>}
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'available', 'occupied', 'maintenance'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>{s}</button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={fetchData}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}><AlertTriangle size={15} /><span>{error}</span></div>}

      {/* Bed Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {filtered.map(bed => (
            <div key={bed._id} className="card" style={{ padding: 16, border: `2px solid ${statusBg(bed.status)}`, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{bed.bedNumber}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{bed.ward} · Floor {bed.floor}</div>
                </div>
                <span className="badge" style={{ background: statusBg(bed.status), color: statusColor(bed.status), fontSize: 10 }}>{bed.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                {bed.type} · ₹{bed.pricePerDay}/day
              </div>
              {bed.status === 'occupied' && bed.patient ? (
                <div style={{ marginBottom: 10, padding: '7px 10px', background: '#fee2e2', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>{bed.patient.name}</div>
                  {bed.expectedDischarge && <div style={{ fontSize: 10, color: '#7f1d1d', marginTop: 2 }}>DC: {new Date(bed.expectedDischarge).toLocaleDateString()}</div>}
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: 6 }}>
                {bed.status === 'available' && <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAssignBed(bed)}>Assign</button>}
                {bed.status === 'occupied' && <button className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleRelease(bed._id)}>Release</button>}
                {bed.status === 'maintenance' && <span style={{ fontSize: 11, color: 'var(--text-muted)', margin: 'auto' }}>Under Maintenance</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
