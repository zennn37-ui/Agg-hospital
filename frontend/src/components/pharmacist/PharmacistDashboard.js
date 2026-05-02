import React, { useState, useEffect } from 'react';
import { Pill, Package, AlertTriangle, CheckCircle, Clock, Plus, Search, X } from 'lucide-react';
import api from '../../utils/api';

function AddItemModal({ onClose, onSave, loading }) {
  const [form, setForm] = useState({ name:'', genericName:'', category:'', stock:0, unit:'tablets', price:0, expiryDate:'', minStockLevel:50, manufacturer:'', batchNumber:'' });
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Inventory Item</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer' }}><X size={20} color="var(--text-muted)" /></button>
        </div>
        <div className="two-col">
          {[['name','Drug Name','Paracetamol 500mg'],['genericName','Generic Name','Acetaminophen'],['category','Category','Analgesic'],['manufacturer','Manufacturer','Sun Pharma'],['batchNumber','Batch No.','BAT-001'],['unit','Unit','tablets']].map(([k,label,ph]) => (
            <div key={k} className="form-group"><label className="form-label">{label}</label><input className="form-control" placeholder={ph} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} /></div>
          ))}
          {[['stock','Current Stock','500'],['price','Price (₹)','5'],['minStockLevel','Min Stock Level','50']].map(([k,label,ph]) => (
            <div key={k} className="form-group"><label className="form-label">{label}</label><input type="number" className="form-control" placeholder={ph} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} /></div>
          ))}
          <div className="form-group"><label className="form-label">Expiry Date</label><input type="date" className="form-control" value={form.expiryDate} onChange={e => setForm(f => ({...f,expiryDate:e.target.value}))} /></div>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button className="btn btn-primary" disabled={loading || !form.name} onClick={() => onSave(form)}>{loading ? 'Adding…' : 'Add Item'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function PharmacistDashboard() {
  const [tab, setTab] = useState('prescriptions');
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'prescriptions') { const r = await api.get('/prescriptions'); setPrescriptions(r.data.data || []); }
      else { const r = await api.get('/inventory'); setInventory(r.data.data || []); }
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleDispense = async (id) => {
    try { await api.put(`/prescriptions/${id}/dispense`); fetchData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleAddItem = async (form) => {
    setAdding(true);
    try { await api.post('/inventory', form); setShowModal(false); fetchData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setAdding(false); }
  };

  const filteredInv = inventory.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));
  const filteredRx = prescriptions.filter(r => !search || r.patient?.name?.toLowerCase().includes(search.toLowerCase()));

  const stockBg = s => s === 'in-stock' ? '#d1fae5' : s === 'low-stock' ? '#fef3c7' : '#fee2e2';
  const stockColor = s => s === 'in-stock' ? '#065f46' : s === 'low-stock' ? '#92400e' : '#991b1b';

  return (
    <div className="fade-in">
      {showModal && <AddItemModal onClose={() => setShowModal(false)} onSave={handleAddItem} loading={adding} />}

      <div style={{ background:'linear-gradient(135deg, #172554, #1e40af, #60a5fa)', borderRadius:20, padding:'24px 32px', marginBottom:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-20, top:-30, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
        <h2 style={{ color:'#fff', fontSize:22, fontFamily:'var(--font-display)' }}>Pharmacy Desk</h2>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, marginTop:3 }}>AGG Hospital Pharmacy · Drug Management</p>
        <div style={{ display:'flex', gap:14, marginTop:14 }}>
          {[{val: prescriptions.filter(p=>p.status==='pending').length, label:'Pending Rx'}, {val: inventory.filter(i=>i.status!=='in-stock').length, label:'Stock Alerts', red:true}].map((item,i) => (
            <div key={i} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.14)', borderRadius:10 }}>
              <div style={{ color: item.red ? '#fca5a5' : '#fff', fontWeight:700 }}>{item.val}</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom:22 }}>
        {[
          { label:'Pending Rx', value: prescriptions.filter(p=>p.status==='pending').length, icon:Clock, color:'#f59e0b', bg:'#fef3c7' },
          { label:'Dispensed Today', value: prescriptions.filter(p=>p.status==='dispensed').length, icon:CheckCircle, color:'#00d4aa', bg:'#ccfbf1' },
          { label:'Low/Out of Stock', value: inventory.filter(i=>i.status!=='in-stock').length, icon:AlertTriangle, color:'#ef4444', bg:'#fee2e2' },
          { label:'Total SKUs', value: inventory.length, icon:Package, color:'#60a5fa', bg:'#dbeafe' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background:s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom:16 }}>{error}</div>}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div className="tabs">
          {['prescriptions','inventory'].map(t => (
            <button key={t} onClick={() => { setTab(t); setSearch(''); }} className={`tab-btn ${tab===t?'active':''}`} style={{ textTransform:'capitalize' }}>{t}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <div className="search-bar" style={{ width:220 }}>
            <Search size={13} color="var(--text-muted)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}…`} />
          </div>
          {tab==='inventory' && <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Item</button>}
        </div>
      </div>

      {tab === 'prescriptions' && (
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border-light)' }}>
            <h2 style={{ fontSize:15, fontWeight:700 }}>Incoming Prescriptions ({filteredRx.length})</h2>
          </div>
          {loading ? <div style={{ padding:20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:70, borderRadius:8, marginBottom:8 }} />)}</div>
            : filteredRx.length === 0 ? <div className="empty-state"><h3>No prescriptions found</h3></div>
            : (
              <div style={{ overflowX:'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Patient</th><th>Doctor</th><th>Medications</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredRx.map(rx => (
                      <tr key={rx._id}>
                        <td style={{ fontWeight:500 }}>{rx.patient?.name}</td>
                        <td style={{ fontSize:13 }}>{rx.doctor?.name}</td>
                        <td><div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>{rx.medications?.map((m,i)=><span key={i} className="badge badge-blue" style={{ fontSize:10 }}>{m.name} {m.dose}</span>)}</div></td>
                        <td style={{ fontSize:12 }}>{new Date(rx.createdAt).toLocaleDateString('en-IN')}</td>
                        <td><span className={`badge badge-${rx.status==='dispensed'?'green':'yellow'}`} style={{ fontSize:11 }}>{rx.status}</span></td>
                        <td>{rx.status==='pending' ? <button className="btn btn-success btn-sm" onClick={() => handleDispense(rx._id)}><CheckCircle size={13} /> Dispense</button> : <span style={{ fontSize:12, color:'var(--text-muted)' }}>✓ Done</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}

      {tab === 'inventory' && (
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border-light)' }}>
            <h2 style={{ fontSize:15, fontWeight:700 }}>Drug Inventory ({filteredInv.length})</h2>
          </div>
          {loading ? <div style={{ padding:20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:52, borderRadius:8, marginBottom:8 }} />)}</div>
            : filteredInv.length === 0 ? <div className="empty-state"><h3>No items found</h3></div>
            : (
              <div style={{ overflowX:'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Drug Name</th><th>Category</th><th>Stock</th><th>Unit</th><th>Price</th><th>Expiry</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredInv.map(item => (
                      <tr key={item._id}>
                        <td style={{ fontWeight:600 }}>{item.name}<div style={{ fontSize:11, color:'var(--text-muted)' }}>{item.genericName}</div></td>
                        <td><span className="badge badge-purple" style={{ fontSize:10.5 }}>{item.category}</span></td>
                        <td style={{ fontWeight:700, color: item.stock===0 ? 'var(--danger)' : item.stock<=item.minStockLevel ? 'var(--warning)' : 'var(--success)' }}>{item.stock.toLocaleString()}</td>
                        <td style={{ fontSize:12 }}>{item.unit}</td>
                        <td style={{ fontSize:12 }}>₹{item.price}</td>
                        <td style={{ fontSize:12 }}>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td><span className="badge" style={{ background:stockBg(item.status), color:stockColor(item.status), fontSize:11 }}>{item.status.replace('-',' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
