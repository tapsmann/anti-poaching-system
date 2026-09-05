import React, { useEffect, useMemo, useState } from 'react';
import { FileText, MapPin, Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { reportsApi } from '../api/endpoints';
import Modal from '../components/common/Modal';

const statusColors = {
  pending: 'badge-medium',
  verified: 'badge-low',
  investigating: 'badge-high',
  resolved: 'badge-low',
  dismissed: 'badge-critical',
};

const statusIcons = {
  pending: Eye,
  verified: CheckCircle,
  investigating: Search,
  resolved: CheckCircle,
  dismissed: XCircle,
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      setError('');
      const { data } = await reportsApi.getAll();
      setReports(data || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() =>
    reports.filter((r) =>
      (!status || r.status === status) &&
      `${r.description} ${r.report_type || ''}`.toLowerCase().includes(query.toLowerCase())
    ), [reports, query, status]
  );

  const updateStatus = async (id, newStatus) => {
    try {
      await reportsApi.update(id, { status: newStatus });
      setSelected(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to update report.');
    }
  };

  if (loading) return <div className="text-center py-10">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Community Reports</h1>
          <p className="text-sm text-gray-500">Reports from community members near protected areas</p>
        </div>
        <button onClick={load} className="btn-primary">Refresh</button>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 border rounded-xl">
          <option value="">All statuses</option>
          {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {visible.map((r) => {
          const StatusIcon = statusIcons[r.status] || Eye;
          return (
            <article key={r.id} className="card-zim cursor-pointer" onClick={() => setSelected(r)}>
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-3 items-center">
                    <h2 className="font-semibold text-zim-800">{r.report_type?.replace('_', ' ') || 'General report'}</h2>
                    <span className={statusColors[r.status] || 'badge-medium'}>{r.status}</span>
                    {r.is_anonymous && <span className="text-xs text-gray-400">Anonymous</span>}
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{r.description}</p>
                  <p className="mt-2 text-sm text-gray-500 flex flex-wrap gap-4">
                    <span className="flex gap-1">
                      <MapPin size={14} />
                      {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}
                    </span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    {r.ranger_name && <span>Assigned: {r.ranger_name}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Risk</p>
                    <p className="text-lg font-bold text-zim-800">{Math.round(r.risk_score || 0)}%</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {!visible.length && <p className="text-center text-gray-500 py-10">No reports match the filters.</p>}
      </div>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Report Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={statusColors[selected.status]}>{selected.status}</span>
              <span className="text-sm text-gray-500">{selected.report_type?.replace('_', ' ')}</span>
              {selected.is_anonymous && <span className="text-xs text-gray-400">Anonymous</span>}
            </div>
            <p className="text-sm text-gray-700">{selected.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><strong>Risk score:</strong> {Math.round(selected.risk_score || 0)}%</div>
              <div><strong>Phone:</strong> {selected.reporter_phone || 'Hidden'}</div>
              <div><strong>Location:</strong> {selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}</div>
              <div><strong>Date:</strong> {new Date(selected.created_at).toLocaleDateString()}</div>
            </div>
            {selected.ranger_notes && (
              <div className="bg-earth-50 p-3 rounded-lg text-sm">
                <strong>Ranger notes:</strong> {selected.ranger_notes}
              </div>
            )}
            {selected.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(selected.id, 'verified')} className="btn-primary text-sm">Verify</button>
                <button onClick={() => updateStatus(selected.id, 'dismissed')} className="border rounded-lg px-3 py-1 text-sm text-red-600">Dismiss</button>
              </div>
            )}
            {selected.status === 'verified' && (
              <button onClick={() => updateStatus(selected.id, 'investigating')} className="btn-primary text-sm">Start Investigation</button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
