import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, Filter, CheckCircle, XCircle, AlertCircle, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function BookModal({ onClose, onSave, loading }) {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', type: 'New Visit', department: '', symptoms: '' });
  useEffect(() => { api.get('/users?role=doctor').then(r => setDoctors(r.data.data || [])).catch(() => {}); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const times = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];
  const selectedDoc = doctors.find(d => d._id === form.doctorId);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Book Appointment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Select Doctor *</label>
          <select className="form-control" value={form.doctorId} onChange={e => { const d = doctors.find(d => d._id === e.target.value); set('doctorId', e.target.value); if (d) set('department', d.doctorInfo?.specialization || ''); }}>
            <option value="">Choose a doctor</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.name} – {d.doctorInfo?.specialization || 'General'}</option>)}
          </select>
        </div>
        {selectedDoc && (
          <div style={{ padding: '12px 14px', background: 'var(--primary-lighter)', borderRadius: 10, marginBottom: 16, fontSize: 13, color: 'var(--primary)' }}>
            💰 Consultation Fee: ₹{selectedDoc.doctorInfo?.consultationFee || 0} · 🕐 {selectedDoc.doctorInfo?.schedule || 'Check availability'}
          </div>
        )}
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input type="date" className="form-control" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Time Slot *</label>
            <select className="form-control" value={form.time} onChange={e => set('time', e.target.value)}>
              <option value="">Select time</option>
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Visit Type</label>
            <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
              {['New Visit','Follow-up','Emergency','Surgery Consult','Routine Checkup'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input className="form-control" placeholder="Auto-filled from doctor" value={form.department} onChange={e => set('department', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Symptoms / Reason</label>
          <textarea className="form-control" rows={3} placeholder="Describe your symptoms or reason for visit" value={form.symptoms} onChange={e => set('symptoms', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" disabled={loading || !form.doctorId || !form.date || !form.time} onClick={() => onSave(form)}>{loading ? 'Booking...' : 'Book Appointment'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const canBook = ['patient','receptionist'].includes(user?.role);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try { const res = await api.get('/appointments?limit=50'); setAppointments(res.data.data || []); }
    catch { setError('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const handleBook = async (form) => {
    setBooking(true);
    try { await api.post('/appointments', form); setShowModal(false); fetchAppointments(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to book'); }
    finally { setBooking(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await api.delete(`/appointments/${id}`, { data: { reason: 'Cancelled by user' } }); fetchAppointments(); }
    catch { setError('Failed to cancel'); }
  };

  const handleConfirm = async (id) => {
    try { await api.put(`/appointments/${id}`, { status: 'confirmed' }); fetchAppointments(); }
    catch { setError('Failed to update'); }
  };

  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = !search || a.patient?.name?.toLowerCase().includes(search.toLowerCase()) || a.doctor?.name?.toLowerCase().includes(search.toLowerCase()) || a.department?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusIcon = (s) => s === 'confirmed' ? <CheckCircle size={13} /> : s === 'cancelled' ? <XCircle size={13} /> : <AlertCircle size={13} />;
  const statusClass = (s) => s === 'confirmed' ? 'badge-green' : s === 'cancelled' ? 'badge-red' : s === 'completed' ? 'badge-teal' : 'badge-yellow';

  return (
    <div className="fade-in">
      {showModal && <BookModal onClose={() => setShowModal(false)} onSave={handleBook} loading={booking} />}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient, doctor, department..." />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','confirmed','pending','cancelled','completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
        {canBook && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Book</button>}
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}><AlertCircle size={15} /><span>{error}</span></div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total', value: appointments.length, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: '#065f46', bg: '#d1fae5' },
          { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: '#92400e', bg: '#fef3c7' },
          { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#991b1b', bg: '#fee2e2' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color={s.color} />
            </div>
            <div><div style={{ fontSize: 22, fontWeight: 700 }}>{loading ? '—' : s.value}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Appointments ({filtered.length})</h2>
          <Filter size={15} color="var(--text-muted)" />
        </div>
        {loading ? (
          <div style={{ padding: 24 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 8 }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Calendar size={28} color="var(--primary)" /></div><h3>No appointments found</h3><p>No appointments match your current filters</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(apt => (
                  <tr key={apt._id}>
                    <td style={{ fontWeight: 500 }}>{apt.patient?.name || 'N/A'}</td>
                    <td>{apt.doctor?.name || 'N/A'}</td>
                    <td><span className="badge badge-blue">{apt.department}</span></td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={12} color="var(--text-muted)" />{new Date(apt.date).toLocaleDateString('en-IN')}</td>
                    <td><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} color="var(--text-muted)" />{apt.time}</span></td>
                    <td><span className="badge badge-gray">{apt.type}</span></td>
                    <td><span className={`badge ${statusClass(apt.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{statusIcon(apt.status)}{apt.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {apt.status === 'pending' && ['doctor','receptionist','admin'].includes(user?.role) && (
                          <button className="btn btn-success btn-sm" onClick={() => handleConfirm(apt._id)}>Confirm</button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(apt._id)}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
