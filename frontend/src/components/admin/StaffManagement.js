import React, { useState, useEffect } from 'react';
import { Search, Plus, Star, Users, X } from 'lucide-react';
import api from '../../utils/api';

function AddStaffModal({ onClose, onSave, loading, initialData }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialData || { name:'', email:'', password:'password123', role:'doctor', phone:'', doctorInfo:{ specialization:'', qualification:'', experience:0, consultationFee:0, licenseNumber:'', schedule:'' } });
  
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:99999, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="modal" style={{ width:'100%', maxWidth:'560px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Edit Staff Member' : step === 1 ? 'Add Staff Member' : 'Doctor Details'}</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer' }}><X size={20} /></button>
        </div>

        {step === 1 && (
          <div className="two-col">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Role *</label><select className="form-control" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>{['doctor','nurse','receptionist','pharmacist'].map(r=><option key={r} style={{ textTransform:'capitalize' }}>{r}</option>)}</select></div>
          </div>
        )}

        {step === 2 && form.role === 'doctor' && (
          <div className="two-col">
            {[['specialization','Specialization'],['qualification','Qualification'],['licenseNumber','License No.'],['schedule','Schedule']].map(([k,l])=>(
              <div key={k} className="form-group"><label className="form-label">{l}</label><input className="form-control" value={form.doctorInfo[k]||''} onChange={e=>setForm(f=>({...f,doctorInfo:{...f.doctorInfo,[k]:e.target.value}}))} /></div>
            ))}
            <div className="form-group"><label className="form-label">Experience (yrs)</label><input type="number" className="form-control" value={form.doctorInfo.experience} onChange={e=>setForm(f=>({...f,doctorInfo:{...f.doctorInfo,experience:e.target.value}}))} /></div>
            <div className="form-group"><label className="form-label">Consultation Fee (₹)</label><input type="number" className="form-control" value={form.doctorInfo.consultationFee} onChange={e=>setForm(f=>({...f,doctorInfo:{...f.doctorInfo,consultationFee:e.target.value}}))} /></div>
          </div>
        )}

        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>Default password: <strong>password123</strong> (user can change after login)</p>
        
        <div style={{ display:'flex', gap:10 }}>
          {step === 1 && form.role === 'doctor' && (
            <button className="btn btn-primary" disabled={!form.name||!form.email} onClick={() => setStep(2)}>Next →</button>
          )}
          {(step === 2 || form.role !== 'doctor') && (
            <button className="btn btn-primary" disabled={loading||!form.name||!form.email} onClick={() => onSave(form)}>{loading ? 'Saving…' : initialData ? 'Save Changes' : 'Create Staff'}</button>
          )}
          {step === 2 && <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>}
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ViewStaffModal({ staff, onClose }) {
  if (!staff) return null;
  const info = staff.doctorInfo || staff.nurseInfo || {};
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:999999, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'20px', overflowY:'auto' }}>
      <div className="modal" style={{ width:'100%', maxWidth:'480px', maxHeight:'90vh', overflowY:'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">Staff Details</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer' }}><X size={20} /></button>
        </div>
        <div className="two-col">
          <div className="form-group"><label className="form-label">Name</label><p>{staff.name}</p></div>
          <div className="form-group"><label className="form-label">Email</label><p>{staff.email}</p></div>
          <div className="form-group"><label className="form-label">Phone</label><p>{staff.phone || '—'}</p></div>
          <div className="form-group"><label className="form-label">Role</label><p style={{ textTransform:'capitalize' }}>{staff.role}</p></div>
          <div className="form-group"><label className="form-label">Status</label><p>{staff.isActive ? 'Active' : 'Inactive'}</p></div>
          {info.specialization && <div className="form-group"><label className="form-label">Specialization</label><p>{info.specialization}</p></div>}
          {info.qualification && <div className="form-group"><label className="form-label">Qualification</label><p>{info.qualification}</p></div>}
          {info.experience !== undefined && <div className="form-group"><label className="form-label">Experience</label><p>{info.experience} yrs</p></div>}
          {info.consultationFee !== undefined && <div className="form-group"><label className="form-label">Consultation Fee</label><p>₹{info.consultationFee}</p></div>}
          {info.licenseNumber && <div className="form-group"><label className="form-label">License No.</label><p>{info.licenseNumber}</p></div>}
          {info.ward && <div className="form-group"><label className="form-label">Ward</label><p>{info.ward}</p></div>}
          {info.shift && <div className="form-group"><label className="form-label">Shift</label><p>{info.shift}</p></div>}
        </div>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
export default function StaffManagement() {
  const [tab, setTab] = useState('doctors');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [viewStaff, setViewStaff] = useState(null);
  const [editStaff, setEditStaff] = useState(null);

  const roleMap = { doctors:'doctor', nurses:'nurse', receptionists:'receptionist', pharmacists:'pharmacist' };

  useEffect(() => { fetchStaff(); }, [tab]);

  const fetchStaff = async () => {
    setLoading(true);
    try { const r = await api.get(`/users?role=${roleMap[tab]}`); setStaff(r.data.data || []); }
    catch { setError('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (form) => {
    setCreating(true);
    try { await api.post('/users', form); setShowModal(false); fetchStaff(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to create'); }
    finally { setCreating(false); }
  };

  const handleEdit = async (form) => {
  setCreating(true);
  try { await api.put(`/users/${editStaff._id}`, form); setEditStaff(null); fetchStaff(); }
  catch (err) { setError(err.response?.data?.message || 'Failed to update'); }
  finally { setCreating(false); }
  };

  const filtered = staff.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      {showModal && <AddStaffModal onClose={() => setShowModal(false)} onSave={handleCreate} loading={creating} />}
      {viewStaff && <ViewStaffModal staff={viewStaff} onClose={() => setViewStaff(null)} />}
      {editStaff && <AddStaffModal onClose={() => setEditStaff(null)} onSave={handleEdit} loading={creating} initialData={editStaff} />}
      <div style={{ display:'flex', gap:12, marginBottom:22, alignItems:'center' }}>
        <div className="search-bar" style={{ flex:1 }}><Search size={14} color="var(--text-muted)" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff…" /></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Add Staff</button>
      </div>
      <div style={{ display:'flex', gap:4, marginBottom:22, background:'#fff', borderRadius:12, padding:4, border:'1px solid var(--border)', width:'fit-content' }}>
        {['doctors','nurses','receptionists','pharmacists'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab===t?'active':''}`} style={{ textTransform:'capitalize' }}>{t}</button>
        ))}
      </div>
      {error && <div className="alert alert-danger" style={{ marginBottom:16 }}>{error}</div>}
      {loading ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:160, borderRadius:14 }} />)}</div>
        : filtered.length === 0 ? <div className="card"><div className="empty-state"><div className="empty-state-icon"><Users size={28} color="var(--primary)" /></div><h3>No {tab} found</h3><p>Add {tab} using the button above</p></div></div>
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {filtered.map(s => (
              <div key={s._id} className="card" style={{ padding:20 }}>
                <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ width:50, height:50, borderRadius:'50%', background:`linear-gradient(135deg, var(--primary), var(--accent))`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:15, fontWeight:700, flexShrink:0 }}>
                    {s.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontSize:14, fontWeight:700 }}>{s.name}</h3>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{s.email}</p>
                    {s.doctorInfo?.specialization && <p style={{ fontSize:12, color:'var(--primary)', marginTop:2 }}>{s.doctorInfo.specialization}</p>}
                    {s.nurseInfo?.ward && <p style={{ fontSize:12, color:'#7c3aed', marginTop:2 }}>Ward: {s.nurseInfo.ward} · {s.nurseInfo.shift}</p>}
                    {s.doctorInfo?.rating > 0 && <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}><Star size={11} color="#f59e0b" fill="#f59e0b" /><span style={{ fontSize:12, fontWeight:600 }}>{s.doctorInfo.rating}</span><span style={{ fontSize:11, color:'var(--text-muted)' }}>· {s.doctorInfo.experience}yr exp</span></div>}
                  </div>
                  <span className={`badge badge-${s.isActive?'green':'red'}`} style={{ fontSize:10 }}>{s.isActive?'Active':'Inactive'}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }} onClick={() => setViewStaff(s)}>View</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditStaff(s)}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
