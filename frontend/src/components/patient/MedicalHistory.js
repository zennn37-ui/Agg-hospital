import React, { useState, useEffect } from 'react';
import { FileText, Pill, User, Calendar, ChevronDown, ChevronUp, Activity, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function AddRecordModal({ onClose, onSave, patients, loading }) {
  const [form, setForm] = useState({ patient: '', diagnosis: '', symptoms: '', notes: '', followUpDate: '', medications: [{ name: '', dose: '', frequency: '', duration: '' }], vitals: { bloodPressure: '', pulse: '', temperature: '', weight: '', spo2: '' } });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setMed = (i, key, val) => { const m = [...form.medications]; m[i][key] = val; setForm(f => ({ ...f, medications: m })); };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">New Medical Record</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
        </div>
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Patient *</label>
            <select className="form-control" value={form.patient} onChange={e => set('patient', e.target.value)}>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Diagnosis *</label>
            <input className="form-control" placeholder="e.g. Hypertension Stage 1" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Symptoms</label>
          <input className="form-control" placeholder="Patient-reported symptoms" value={form.symptoms} onChange={e => set('symptoms', e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Medications</label>
            <button className="btn btn-outline btn-sm" onClick={() => setForm(f => ({ ...f, medications: [...f.medications, { name: '', dose: '', frequency: '', duration: '' }] }))}>+ Add</button>
          </div>
          {form.medications.map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr auto', gap: 8, marginBottom: 8 }}>
              <input className="form-control" placeholder="Drug name" value={m.name} onChange={e => setMed(i, 'name', e.target.value)} />
              <input className="form-control" placeholder="Dose" value={m.dose} onChange={e => setMed(i, 'dose', e.target.value)} />
              <input className="form-control" placeholder="Frequency" value={m.frequency} onChange={e => setMed(i, 'frequency', e.target.value)} />
              <input className="form-control" placeholder="Duration" value={m.duration} onChange={e => setMed(i, 'duration', e.target.value)} />
              {i > 0 && <button onClick={() => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={16} /></button>}
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <label className="form-label">Vitals</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {[['bloodPressure', 'BP (mmHg)'], ['pulse', 'Pulse (bpm)'], ['temperature', 'Temp (°F)'], ['weight', 'Weight (kg)'], ['spo2', 'SpO2 (%)']].map(([k, ph]) => (
              <input key={k} className="form-control" placeholder={ph} value={form.vitals[k]} onChange={e => setForm(f => ({ ...f, vitals: { ...f.vitals, [k]: e.target.value } }))} />
            ))}
          </div>
        </div>
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Doctor's Notes</label>
            <textarea className="form-control" rows={3} placeholder="Clinical notes and instructions" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Follow-up Date</label>
            <input type="date" className="form-control" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" disabled={loading || !form.patient || !form.diagnosis} onClick={() => onSave(form)}>{loading ? 'Saving...' : 'Save Record'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function MedicalHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDoctor = user?.role === 'doctor';
  const isNurse = user?.role === 'nurse';

  useEffect(() => {
    fetchRecords();
    if (isDoctor) api.get('/users?role=patient').then(r => setPatients(r.data.data || [])).catch(() => {});
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get('/records');
      setRecords(res.data.data || []);
    } catch { setError('Failed to load records'); }
    finally { setLoading(false); }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      await api.post('/records', form);
      setShowModal(false);
      fetchRecords();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-in">
      {showModal && <AddRecordModal onClose={() => setShowModal(false)} onSave={handleSave} patients={patients} loading={saving} />}

      {/* Access banner */}
      <div style={{ marginBottom: 20, padding: '13px 18px', background: 'var(--primary-lighter)', borderRadius: 10, border: '1px solid rgba(10,77,104,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
          🔒 {isDoctor ? 'Full access — view, create and edit all records' : isNurse ? 'Read access — view records and vitals' : 'Personal records — your own medical history'}
        </span>
        {isDoctor && <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} /> New Record</button>}
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
        </div>
      ) : records.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon"><FileText size={30} color="var(--primary)" /></div><h3>No medical records found</h3><p>Records will appear here once created by a doctor</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {records.map(record => (
            <div key={record._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }} onClick={() => setExpanded(expanded === record._id ? null : record._id)}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={22} color="#3b82f6" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{record.diagnosis}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} /> {record.doctor?.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {new Date(record.createdAt).toLocaleDateString('en-IN')}</span>
                    {record.followUpDate && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Follow-up: {new Date(record.followUpDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 240 }}>
                  {record.medications?.slice(0, 2).map((m, i) => <span key={i} className="badge badge-purple" style={{ fontSize: 11 }}>{m.name}</span>)}
                  {record.medications?.length > 2 && <span className="badge badge-gray" style={{ fontSize: 11 }}>+{record.medications.length - 2}</span>}
                </div>
                {expanded === record._id ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </div>

              {expanded === record._id && (
                <div style={{ borderTop: '1px solid var(--border-light)', padding: '20px 24px', background: 'var(--bg)' }}>
                  <div className="three-col">
                    {/* Vitals */}
                    <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Activity size={15} color="var(--primary)" />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>Vitals at Visit</span>
                      </div>
                      {record.vitals && Object.entries(record.vitals).map(([k, v]) => v ? (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k === 'bloodPressure' ? 'Blood Pressure' : k === 'spo2' ? 'SpO2' : k.charAt(0).toUpperCase() + k.slice(1)}</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
                        </div>
                      ) : null)}
                    </div>

                    {/* Medications */}
                    <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Pill size={15} color="#8b5cf6" />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>Prescribed Medications</span>
                      </div>
                      {record.medications?.map((m, i) => (
                        <div key={i} style={{ marginBottom: 10, padding: 8, background: '#f5f3ff', borderRadius: 8, border: '1px solid #ede9fe' }}>
                          <div style={{ fontWeight: 600, fontSize: 12.5, color: '#6d28d9' }}>{m.name} – {m.dose}</div>
                          <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 2 }}>{m.frequency} · {m.duration}</div>
                          {m.instructions && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.instructions}</div>}
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <FileText size={15} color="#f59e0b" />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>Doctor's Notes</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{record.notes || 'No notes added.'}</p>
                      {record.symptoms && <div style={{ marginTop: 10, padding: 8, background: '#fef3c7', borderRadius: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#92400e' }}>Symptoms: </span>
                        <span style={{ fontSize: 12, color: '#92400e' }}>{record.symptoms}</span>
                      </div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
