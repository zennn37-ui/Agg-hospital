import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Heart, Droplets, AlertTriangle, Pill, Clock, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function LogVitalsModal({ patient, onClose, onSave, loading }) {
  const [form, setForm] = useState({ bloodPressure: '', pulse: '', temperature: '', weight: '', spo2: '', notes: '', ward: '', bed: '' });
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Log Vitals – {patient?.name}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {[['bloodPressure','Blood Pressure (mmHg)','120/80'], ['pulse','Pulse (bpm)','72'], ['temperature','Temperature (°F)','98.6'], ['weight','Weight (kg)','70'], ['spo2','SpO2 (%)','98'], ['bed','Bed Number','A-101']].map(([k,label,ph]) => (
            <div key={k} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{label}</label>
              <input className="form-control" placeholder={ph} value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} />
            </div>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Nurse Notes</label>
          <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" disabled={loading} onClick={() => onSave({ ...form, patient: patient._id })}>
            {loading ? 'Saving…' : 'Save Vitals'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function NurseDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users/nurse/patients')
      .then(r => setPatients(r.data.data || []))
      .catch(() => setError('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogVitals = async (data) => {
    setSaving(true);
    try {
      await api.post('/vitals', data);
      setSelectedPatient(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-in">
      {selectedPatient && <LogVitalsModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} onSave={handleLogVitals} loading={saving} />}

      <div style={{ background: 'linear-gradient(135deg, #4a0062, #7c3aed, #e879f9)', borderRadius: 20, padding: '24px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <h2 style={{ color: '#fff', fontSize: 22, fontFamily: 'var(--font-display)' }}>Nurse Station – {user?.nurseInfo?.ward || 'Ward'}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 3 }}>{user?.name} · Shift: {user?.nurseInfo?.shift || 'Morning'}</p>
        <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
          {[{val: patients.length, label: 'Patients Assigned'}, {val: '4', label: 'Med Tasks Due'}].map((item, i) => (
            <div key={i} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.14)', borderRadius: 10 }}>
              <div style={{ color: '#fff', fontWeight: 700 }}>{item.val}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Patients Assigned', value: patients.length, icon: Activity, color: '#e879f9', bg: '#fdf4ff' },
          { label: 'Vitals Pending', value: '3', icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Meds to Administer', value: '6', icon: Pill, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Critical Patients', value: '1', icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      <h2 style={{ fontSize: 17, marginBottom: 16 }}>Assigned Patients</h2>
      {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 12 }} />) :
        patients.length === 0 ? (
          <div className="card"><div className="empty-state"><h3>No patients assigned</h3></div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {patients.map(p => (
              <div key={p._id} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {p.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</h3>
                      <span className="badge badge-blue" style={{ fontSize: 10.5 }}>{p.patientInfo?.bloodGroup || 'N/A'}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.phone || 'No contact'} · {p.patientInfo?.chronicConditions?.join(', ') || 'No conditions'}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      {[{ icon: Heart, label: 'BP', color: '#3b82f6', bg: '#dbeafe' }, { icon: Thermometer, label: 'Temp', color: '#f59e0b', bg: '#fef3c7' }, { icon: Droplets, label: 'SpO2', color: '#22c55e', bg: '#dcfce7' }, { icon: Activity, label: 'Pulse', color: '#ef4444', bg: '#fee2e2' }].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: item.bg, borderRadius: 8 }}>
                          <item.icon size={12} color={item.color} />
                          <span style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.label}: —</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedPatient(p)}><Plus size={13} /> Log Vitals</button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
