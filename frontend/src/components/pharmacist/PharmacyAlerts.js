import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, CheckCircle, Clock, RefreshCw, Bell } from 'lucide-react';
import api from '../../utils/api';

export default function PharmacyAlerts() {
  const [lowStock, setLowStock] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lsRes, rxRes] = await Promise.all([
        api.get('/inventory/low-stock'),
        api.get('/prescriptions?status=pending'),
      ]);
      setLowStock(lsRes.data.data || []);
      setPending(rxRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalAlerts = lowStock.length + pending.length;

  return (
    <div className="fade-in">
      {/* Summary */}
      <div style={{ background: totalAlerts > 5 ? 'linear-gradient(135deg, #7f1d1d, #dc2626)' : 'linear-gradient(135deg, #172554, #1e40af)', borderRadius: 20, padding: '24px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: 20, fontFamily: 'var(--font-display)' }}>Pharmacy Alerts</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 3 }}>
              {totalAlerts > 0 ? `${totalAlerts} active alert${totalAlerts !== 1 ? 's' : ''} require attention` : 'All systems normal'}
            </p>
          </div>
          <button onClick={fetchData} className="btn" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Out of Stock', value: lowStock.filter(i => i.status === 'out-of-stock').length, icon: Package, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Low Stock', value: lowStock.filter(i => i.status === 'low-stock').length, icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Pending Prescriptions', value: pending.length, icon: Clock, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Total Alerts', value: totalAlerts, icon: Bell, color: '#3b82f6', bg: '#dbeafe' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-info"><h3>{loading ? '…' : s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Stock alerts */}
      {lowStock.length > 0 && (
        <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={16} color="var(--danger)" />
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Stock Alerts ({lowStock.length})</h2>
          </div>
          <table className="data-table">
            <thead><tr><th>Drug Name</th><th>Category</th><th>Current Stock</th><th>Min Required</th><th>Status</th><th>Expiry</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6}><div className="skeleton" style={{ height: 48, margin: 16, borderRadius: 8 }} /></td></tr> :
                lowStock.map(item => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600 }}>{item.name}<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.genericName}</div></td>
                    <td><span className="badge badge-purple" style={{ fontSize: 10.5 }}>{item.category}</span></td>
                    <td style={{ fontWeight: 700, color: item.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}>{item.stock} {item.unit}</td>
                    <td style={{ fontSize: 13 }}>{item.minStockLevel} {item.unit}</td>
                    <td>
                      <span className={`badge badge-${item.status === 'out-of-stock' ? 'red' : 'yellow'}`} style={{ fontSize: 11 }}>
                        {item.status === 'out-of-stock' ? '❌ Out of Stock' : '⚠️ Low Stock'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Pending prescriptions */}
      {pending.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={16} color="#8b5cf6" />
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Pending Prescriptions ({pending.length})</h2>
          </div>
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Doctor</th><th>Medications</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5}><div className="skeleton" style={{ height: 48, margin: 16, borderRadius: 8 }} /></td></tr> :
                pending.map(rx => (
                  <tr key={rx._id}>
                    <td style={{ fontWeight: 600 }}>{rx.patient?.name}</td>
                    <td style={{ fontSize: 13 }}>{rx.doctor?.name}</td>
                    <td>{rx.medications?.map((m, i) => <span key={i} className="badge badge-blue" style={{ fontSize: 10, marginRight: 4 }}>{m.name}</span>)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(rx.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => api.put(`/prescriptions/${rx._id}/dispense`).then(fetchData)}>
                        <CheckCircle size={13} /> Dispense
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalAlerts === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><CheckCircle size={30} color="var(--success)" /></div>
            <h3>All Clear!</h3>
            <p>No active alerts. All stock levels are adequate and prescriptions are up to date.</p>
          </div>
        </div>
      )}
    </div>
  );
}
