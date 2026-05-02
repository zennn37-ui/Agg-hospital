import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'patient', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setSubmitting(true); setError('');
    const result = await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
    setSubmitting(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #061c28, #0a4d68, #062d3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 500, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #05bfdb, #00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 32px rgba(5,191,219,0.4)' }}>
            <Heart size={28} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 30 }}>AGG Hospital</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>Create your account</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 36 }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.4)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <AlertCircle size={16} color="#f87171" />
              <span style={{ color: '#f87171', fontSize: 13 }}>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'e.g. Arjun Sharma', required: true },
              { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@example.com', required: true },
              { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+91 9876543210' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Min. 6 characters', required: true },
              { label: 'Confirm Password', name: 'confirmPassword', type: 'password', placeholder: 'Repeat password', required: true },
            ].map(field => (
              <div key={field.name} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: 600, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase' }}>{field.label}</label>
                <input name={field.name} type={field.type} placeholder={field.placeholder} required={field.required} value={form[field.name]} onChange={handleChange}
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: 600, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase' }}>Role</label>
              <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }}>
                <option value="patient" style={{ background: '#0a4d68' }}>Patient</option>
                <option value="doctor" style={{ background: '#0a4d68' }}>Doctor</option>
                <option value="nurse" style={{ background: '#0a4d68' }}>Nurse</option>
                <option value="receptionist" style={{ background: '#0a4d68' }}>Receptionist</option>
                <option value="pharmacist" style={{ background: '#0a4d68' }}>Pharmacist</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #05bfdb, #0a4d68)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: submitting ? 0.8 : 1 }}>
              {submitting ? 'Creating Account...' : <> Create Account <ArrowRight size={16} /></>}
            </button>
          </form>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 18 }}>
            Already have an account? <Link to="/login" style={{ color: '#05bfdb' }}>Sign In →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
