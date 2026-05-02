import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, CheckCircle, Clock, AlertCircle, X, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function CreateBillModal({ onClose, onSave, loading }) {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient: '', items: [{ description: '', category: 'Consultation', amount: '', quantity: 1 }], notes: '', dueDate: '' });
  useEffect(() => { api.get('/users?role=patient').then(r => setPatients(r.data.data || [])).catch(() => {}); }, []);
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', category: 'Consultation', amount: '', quantity: 1 }] }));
  const setItem = (i, k, v) => { const items = [...form.items]; items[i][k] = v; setForm(f => ({ ...f, items })); };
  const total = form.items.reduce((s, i) => s + (Number(i.amount) * Number(i.quantity) || 0), 0);
  const cats = ['Consultation', 'Lab', 'Pharmacy', 'Surgery', 'Room', 'Other'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">Create Bill</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Patient *</label>
          <select className="form-control" value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}>
            <option value="">Select patient</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name} – {p.phone || p.email}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Billing Items *</label>
            <button className="btn btn-outline btn-sm" onClick={addItem}>+ Add Item</button>
          </div>
          {form.items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 0.7fr auto', gap: 8, marginBottom: 8 }}>
              <input className="form-control" placeholder="Description" value={item.description} onChange={e => setItem(i, 'description', e.target.value)} />
              <select className="form-control" value={item.category} onChange={e => setItem(i, 'category', e.target.value)}>
                {cats.map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="form-control" type="number" placeholder="Amount ₹" value={item.amount} onChange={e => setItem(i, 'amount', e.target.value)} />
              <input className="form-control" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} />
              {i > 0 && <button onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={16} /></button>}
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: 10, padding: '10px 14px', background: 'var(--primary-lighter)', borderRadius: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>Total: ₹{total.toLocaleString()}</span>
          </div>
        </div>
        <div className="two-col">
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" className="form-control" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <input className="form-control" placeholder="Optional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" disabled={loading || !form.patient || !form.items[0].description} onClick={() => onSave(form)}>{loading ? 'Creating…' : 'Create Bill'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ bill, onClose, onPay, loading }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const remaining = bill.totalAmount - (bill.paidAmount || 0);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">Record Payment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Bill</span>
            <span style={{ fontWeight: 700 }}>₹{bill.totalAmount?.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Paid So Far</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{(bill.paidAmount || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Remaining</span>
            <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 15 }}>₹{remaining.toLocaleString()}</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Payment Amount (₹)</label>
          <input type="number" className="form-control" placeholder={`Max ₹${remaining}`} max={remaining} value={amount} onChange={e => setAmount(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[remaining, Math.round(remaining / 2)].map(v => (
              <button key={v} onClick={() => setAmount(v)} className="btn btn-outline btn-sm">₹{v.toLocaleString()}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['cash', 'card', 'upi', 'insurance'].map(m => (
              <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: `1.5px solid ${method === m ? 'var(--primary)' : 'var(--border)'}`, background: method === m ? 'var(--primary-lighter)' : '#fff', color: method === m ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: method === m ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>
                {m === 'upi' ? 'UPI' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" disabled={loading || !amount || Number(amount) <= 0} onClick={() => onPay(bill._id, amount, method)}>{loading ? 'Processing…' : 'Record Payment'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showPay, setShowPay] = useState(null);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchBills(); fetchStats(); }, []);

  const fetchBills = async () => {
    setLoading(true);
    try { const r = await api.get('/billing'); setBills(r.data.data || []); }
    catch { setError('Failed to load bills'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { const r = await api.get('/billing/stats'); setStats(r.data.data); } catch {}
  };

  const handleCreate = async (form) => {
    setCreating(true);
    try { await api.post('/billing', form); setShowCreate(false); fetchBills(); fetchStats(); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const handlePay = async (id, amount, method) => {
    setPaying(true);
    try { await api.put(`/billing/${id}/pay`, { amount: Number(amount), paymentMethod: method }); setShowPay(null); fetchBills(); fetchStats(); }
    catch (err) { setError(err.response?.data?.message || 'Payment failed'); }
    finally { setPaying(false); }
  };

  const filtered = bills.filter(b => filter === 'all' || b.status === filter);
  const statusClass = s => s === 'paid' ? 'badge-green' : s === 'partial' ? 'badge-yellow' : s === 'cancelled' ? 'badge-red' : 'badge-orange';
  const canCreate = ['receptionist', 'admin'].includes(user?.role);

  return (
    <div className="fade-in">
      {showCreate && <CreateBillModal onClose={() => setShowCreate(false)} onSave={handleCreate} loading={creating} />}
      {showPay && <PaymentModal bill={showPay} onClose={() => setShowPay(null)} onPay={handlePay} loading={paying} />}

      <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'pending', 'partial', 'paid'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
        {canCreate && <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowCreate(true)}><Plus size={14} /> New Bill</button>}
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}><AlertCircle size={15} /><span>{error}</span></div>}

      {/* Stats cards */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total Revenue', value: `₹${(stats?.revenue?.total || 0).toLocaleString()}`, icon: DollarSign, color: '#00d4aa', bg: '#ccfbf1' },
          { label: 'Pending Amount', value: `₹${(stats?.revenue?.pending || 0).toLocaleString()}`, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Bills Paid', value: stats?.paid ?? 0, icon: CheckCircle, color: '#065f46', bg: '#d1fae5' },
          { label: 'Bills Pending', value: stats?.pending ?? 0, icon: AlertCircle, color: '#991b1b', bg: '#fee2e2' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-info"><h3 style={{ fontSize: typeof s.value === 'string' && s.value.includes('₹') ? 18 : 26 }}>{loading ? '…' : s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Bills ({filtered.length})</h2>
        </div>
        {loading ? <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 8, marginBottom: 8 }} />)}</div>
          : filtered.length === 0 ? <div className="empty-state"><div className="empty-state-icon"><CreditCard size={28} color="var(--primary)" /></div><h3>No bills found</h3></div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Patient</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(bill => {
                    const balance = (bill.totalAmount || 0) - (bill.paidAmount || 0);
                    return (
                      <tr key={bill._id}>
                        <td style={{ fontWeight: 600 }}>{bill.patient?.name}<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bill.patient?.phone}</div></td>
                        <td style={{ fontSize: 12 }}>{bill.items?.length} item{bill.items?.length !== 1 ? 's' : ''}</td>
                        <td style={{ fontWeight: 700 }}>₹{(bill.totalAmount || 0).toLocaleString()}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{(bill.paidAmount || 0).toLocaleString()}</td>
                        <td style={{ color: balance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>₹{balance.toLocaleString()}</td>
                        <td><span className={`badge ${statusClass(bill.status)}`} style={{ fontSize: 11 }}>{bill.status}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td>
                          {bill.status !== 'paid' && canCreate && (
                            <button className="btn btn-success btn-sm" onClick={() => setShowPay(bill)}><CreditCard size={12} /> Pay</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}
