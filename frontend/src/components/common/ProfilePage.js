import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', patientInfo: user?.patientInfo || {}, doctorInfo: user?.doctorInfo || {}, nurseInfo: user?.nurseInfo || {} });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleProfileSave = async () => {
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update' }); }
    finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    if (pwd.newPassword !== pwd.confirmPassword) return setMsg({ type: 'error', text: 'New passwords do not match' });
    if (pwd.newPassword.length < 6) return setMsg({ type: 'error', text: 'Password must be at least 6 characters' });
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      await api.put('/auth/password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' }); }
    finally { setSaving(false); }
  };

  const setPatientInfo = (k, v) => setForm(f => ({ ...f, patientInfo: { ...f.patientInfo, [k]: v } }));
  const setDoctorInfo = (k, v) => setForm(f => ({ ...f, doctorInfo: { ...f.doctorInfo, [k]: v } }));

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', borderRadius: 20, padding: '24px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700 }}>
          {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
        </div>
        <div>
          <h2 style={{ color: '#fff', fontSize: 22, fontFamily: 'var(--font-display)' }}>{user?.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{user?.email} · {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {['profile','security'].map(t => (
          <button key={t} onClick={() => { setTab(t); setMsg({ type:'', text:'' }); }} className={`tab-btn ${tab===t?'active':''}`} style={{ textTransform:'capitalize' }}>{t === 'profile' ? '👤 Profile' : '🔐 Security'}</button>
        ))}
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 20 }}>
          {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span>{msg.text}</span>
        </div>
      )}

      {tab === 'profile' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, marginBottom: 22, fontFamily: 'var(--font-body)', fontWeight: 700 }}>Personal Information</h3>
          <div className="two-col">
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Phone Number</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>

          {user?.role === 'patient' && (
            <>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, marginTop: 6, color: 'var(--text-secondary)' }}>Patient Information</h4>
              <div className="two-col">
                <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={form.patientInfo.dateOfBirth?.split('T')[0] || ''} onChange={e => setPatientInfo('dateOfBirth', e.target.value)} /></div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-control" value={form.patientInfo.bloodGroup || ''} onChange={e => setPatientInfo('bloodGroup', e.target.value)}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Gender</label><select className="form-control" value={form.patientInfo.gender || ''} onChange={e => setPatientInfo('gender', e.target.value)}><option value="">Select</option>{['Male','Female','Other'].map(g=><option key={g}>{g}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Emergency Contact</label><input className="form-control" value={form.patientInfo.emergencyContact || ''} onChange={e => setPatientInfo('emergencyContact', e.target.value)} /></div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Address</label><input className="form-control" value={form.patientInfo.address || ''} onChange={e => setPatientInfo('address', e.target.value)} /></div>
              </div>
            </>
          )}

          {user?.role === 'doctor' && (
            <>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, marginTop: 6, color: 'var(--text-secondary)' }}>Professional Information</h4>
              <div className="two-col">
                <div className="form-group"><label className="form-label">Specialization</label><input className="form-control" value={form.doctorInfo.specialization || ''} onChange={e => setDoctorInfo('specialization', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Qualification</label><input className="form-control" value={form.doctorInfo.qualification || ''} onChange={e => setDoctorInfo('qualification', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Experience (years)</label><input type="number" className="form-control" value={form.doctorInfo.experience || ''} onChange={e => setDoctorInfo('experience', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Consultation Fee (₹)</label><input type="number" className="form-control" value={form.doctorInfo.consultationFee || ''} onChange={e => setDoctorInfo('consultationFee', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">License Number</label><input className="form-control" value={form.doctorInfo.licenseNumber || ''} onChange={e => setDoctorInfo('licenseNumber', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Schedule</label><input className="form-control" placeholder="e.g. Mon-Fri 9AM-5PM" value={form.doctorInfo.schedule || ''} onChange={e => setDoctorInfo('schedule', e.target.value)} /></div>
              </div>
            </>
          )}

          <button className="btn btn-primary" disabled={saving} onClick={handleProfileSave} style={{ marginTop: 8 }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, marginBottom: 22, fontFamily: 'var(--font-body)', fontWeight: 700 }}>Change Password</h3>
          <div style={{ maxWidth: 380 }}>
            {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([k,label]) => (
              <div key={k} className="form-group">
                <label className="form-label">{label}</label>
                <input type="password" className="form-control" value={pwd[k]} onChange={e => setPwd(p => ({...p,[k]:e.target.value}))} />
              </div>
            ))}
            <button className="btn btn-primary" disabled={saving || !pwd.currentPassword || !pwd.newPassword} onClick={handlePasswordSave}>
              <Lock size={15} /> {saving ? 'Updating…' : 'Change Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
