import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Stethoscope, Shield, Activity, UserCheck, Pill, ArrowRight, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ROLES = [
  { key: 'patient', label: 'Patient', icon: User, color: '#05bfdb', desc: 'View your health records & appointments', demo: 'patient@agg.com' },
  { key: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#00d4aa', desc: 'Manage patients & prescriptions', demo: 'doctor@agg.com' },
  { key: 'admin', label: 'Administrator', icon: Shield, color: '#c9a84c', desc: 'Hospital management & analytics', demo: 'admin@agg.com' },
  { key: 'nurse', label: 'Nurse', icon: Activity, color: '#e879f9', desc: 'Patient vitals & medication care', demo: 'nurse@agg.com' },
  { key: 'receptionist', label: 'Receptionist', icon: UserCheck, color: '#fb923c', desc: 'Appointments & patient registration', demo: 'reception@agg.com' },
  { key: 'pharmacist', label: 'Pharmacist', icon: Pill, color: '#60a5fa', desc: 'Prescriptions & drug inventory', demo: 'pharmacy@agg.com' },
];

export default function LoginPage() {
  const { login, error: authError, setError } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const selectedRole = ROLES.find(r => r.key === selected);

  const handleRoleSelect = (role) => {
    setSelected(role.key);
    setForm({ email: role.demo, password: 'password123' });
    setLocalError('');
    setError?.(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError('');
    const result = await login(form.email, form.password);
    setSubmitting(false);
    if (result.success) navigate('/dashboard');
    else setLocalError(result.message);
  };

  const errMsg = localError || authError;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #061c28 0%, #0a4d68 55%, #062d3d 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: 20,
    }}>
      {/* Decorative circles */}
      {[320, 480, 640, 800].map((size, i) => (
        <div key={i} style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: '1px solid rgba(5,191,219,0.06)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
      ))}
      <div style={{ position: 'absolute', top: 80, right: 100, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,191,219,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 100, left: 80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 900, animation: 'fadeIn 0.5s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg, #05bfdb, #00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(5,191,219,0.4)' }}>
            <Heart size={32} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 38, fontWeight: 700, letterSpacing: -0.5 }}>AGG Hospital</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 6, letterSpacing: 0.5 }}>AI-Powered Healthcare Management System</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28, padding: '40px 44px' }}>
          {step === 1 && (
            <>
              <h2 style={{ color: '#fff', fontSize: 19, fontWeight: 600, textAlign: 'center', marginBottom: 6 }}>Select Your Role</h2>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, textAlign: 'center', marginBottom: 28 }}>Choose your access portal to continue</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selected === role.key;
                  return (
                    <button key={role.key} onClick={() => handleRoleSelect(role)} style={{
                      background: isSelected ? `${role.color}18` : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${isSelected ? role.color + 'aa' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 16, padding: '20px 14px', cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.2s ease', transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                    }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    >
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: `${role.color}22`, border: `1px solid ${role.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <Icon size={22} color={role.color} />
                      </div>
                      <div style={{ color: isSelected ? role.color : '#fff', fontWeight: 600, fontSize: 13.5, marginBottom: 3 }}>{role.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.4 }}>{role.desc}</div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => selected && setStep(2)} disabled={!selected}
                style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', cursor: selected ? 'pointer' : 'not-allowed', background: selected ? `linear-gradient(135deg, ${selectedRole?.color}, #0a4d68)` : 'rgba(255,255,255,0.08)', color: selected ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', boxShadow: selected ? `0 4px 20px ${selectedRole?.color}44` : 'none' }}>
                Continue as {selectedRole?.label || '...'} <ArrowRight size={17} />
              </button>
            </>
          )}

          {step === 2 && selectedRole && (
            <div style={{ maxWidth: 420, margin: '0 auto' }}>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)' }}>
                ← Back to role selection
              </button>
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${selectedRole.color}22`, border: `2px solid ${selectedRole.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <selectedRole.icon size={26} color={selectedRole.color} />
                </div>
                <h2 style={{ color: '#fff', fontSize: 21, fontWeight: 700 }}>{selectedRole.label} Portal</h2>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, marginTop: 4 }}>Sign in to your account</p>
              </div>

              {errMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.4)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                  <AlertCircle size={16} color="#f87171" />
                  <span style={{ color: '#f87171', fontSize: 13 }}>{errMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: 600, marginBottom: 7, letterSpacing: 0.8, textTransform: 'uppercase' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                      style={{ width: '100%', padding: '11px 14px 11px 40px', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: 600, marginBottom: 7, letterSpacing: 0.8, textTransform: 'uppercase' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                      style={{ width: '100%', padding: '11px 40px 11px 40px', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
                    <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPwd ? <EyeOff size={15} color="rgba(255,255,255,0.4)" /> : <Eye size={15} color="rgba(255,255,255,0.4)" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${selectedRole.color}, #0a4d68)`, color: '#fff', fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 20px ${selectedRole.color}44`, opacity: submitting ? 0.8 : 1 }}>
                  {submitting ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
                </button>
              </form>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 20 }}>
                Demo: credentials are pre-filled. Click Sign In.
              </p>
              <p style={{ textAlign: 'center', marginTop: 12 }}>
                <Link to="/register" style={{ color: selectedRole.color, fontSize: 13 }}>Don't have an account? Register →</Link>
              </p>
            </div>
          )}
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 12, marginTop: 24 }}>© 2024 AGG Hospital · Final Year Project · All rights reserved</p>
      </div>
    </div>
  );
}
