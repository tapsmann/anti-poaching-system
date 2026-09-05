import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Plus, Search, CheckCircle, AlertTriangle, Shield, MapPin } from 'lucide-react';
import { alertsApi } from '../api/endpoints';
import Modal from '../components/common/Modal';

const priorityColors = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
const statusColors = { new: 'bg-blue-100 text-blue-800', sent: 'badge-medium', acknowledged: 'badge-low', resolved: 'badge-low' };

const blank = { alert_type: 'system_alert', priority: 'medium', message: '', latitude: '', longitude: '', radius_km: '' };

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const load = async () => {
    try {
      setError('');
      const params = {};
      if (status) params.status = status;
      const { data } = await alertsApi.getAll(params);
      setAlerts(data || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const visible = useMemo(() =>
    alerts.filter((a) =>
      `${a.message} ${a.alert_type || ''}`.toLowerCase().includes(query.toLowerCase())
    ), [alerts, query]
  );

  const acknowledge = async (id) => {
    try {
      await alertsApi.acknowledge(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to acknowledge.');
    }
  };

  const create = async (ev) => {
    ev.preventDefault();
    try {
      await alertsApi.create({
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        radius_km: form.radius_km ? Number(form.radius_km) : null,
      });
      setCreateOpen(false);
      setForm(blank);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to create alert.');
    }
  };

  if (loading) return <div className="text-center py-10">Loading alerts...</div>;

  const newCount = alerts.filter((a) => a.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Alerts & Notifications</h1>
          <p className="text-sm text-gray-500">{newCount} new alerts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm">Refresh</button>
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Create alert
          </button>
        </div>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search alerts..." className="w-full pl-10 pr-4 py-2 border rounded-xl" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 border rounded-xl">
          <option value="">All statuses</option>
          {['new', 'sent', 'acknowledged', 'resolved'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {visible.map((a) => (
          <article key={a.id} className={`card-zim ${a.status === 'new' ? 'border-l-4 border-l-blue-500' : ''}`}>
            <div className="flex flex-wrap justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50">
                  <Bell size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <h2 className="font-semibold text-zim-800">{a.alert_type.replace('_', ' ')}</h2>
                    <span className={priorityColors[a.priority]}>{a.priority}</span>
                    <span className={`${statusColors[a.status]} px-3 py-1 rounded-full text-xs font-semibold`}>{a.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{a.message}</p>
                  <p className="mt-2 text-sm text-gray-500 flex flex-wrap gap-4">
                    {a.latitude && <span className="flex gap-1"><MapPin size={14} />{a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}</span>}
                    <span>{new Date(a.created_at).toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <div>
                {a.status === 'new' && (
                  <button onClick={() => acknowledge(a.id)} className="text-sm text-blue-700 border border-blue-200 rounded-lg px-3 py-1 flex items-center gap-1">
                    <CheckCircle size={14} /> Acknowledge
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
        {!visible.length && <p className="text-center text-gray-500 py-10">No alerts found.</p>}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Alert">
        <form onSubmit={create} className="grid gap-3">
          <select value={form.alert_type} onChange={(e) => setForm({ ...form, alert_type: e.target.value })} className="border rounded-xl px-3 py-2">
            {['poaching_detected', 'high_risk_zone', 'ranger_emergency', 'community_report', 'patrol_alert', 'system_alert'].map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="border rounded-xl px-3 py-2">
            {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Alert message" className="border rounded-xl px-3 py-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="Latitude" className="border rounded-xl px-3 py-2" />
            <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="Longitude" className="border rounded-xl px-3 py-2" />
          </div>
          <input type="number" step="any" value={form.radius_km} onChange={(e) => setForm({ ...form, radius_km: e.target.value })} placeholder="Radius (km)" className="border rounded-xl px-3 py-2" />
          <button className="btn-primary justify-center">Create alert</button>
        </form>
      </Modal>
    </div>
  );
}
