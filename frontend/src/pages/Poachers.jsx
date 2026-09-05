import React, { useEffect, useMemo, useState } from 'react';
import { Skull, Plus, Search } from 'lucide-react';
import { poachersApi } from '../api/endpoints';
import Modal from '../components/common/Modal';
import OpenLayersMap from '../components/maps/OpenLayersMap';

const threatColors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const threatBadges = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

const blank = {
  alias: '', description: '', known_affiliate: '', threat_level: 'medium',
  methods_used: '', target_species: '', estimated_age: '', nationality: '',
  identifying_marks: '', latitude: '-19.0', longitude: '29.5'
};

const poacherToHotspot = (p) => ({
  lat: p.latitude,
  lng: p.longitude,
  risk_score: p.threat_level === 'critical' ? 90 : p.threat_level === 'high' ? 70 : p.threat_level === 'medium' ? 50 : 30,
  park: p.known_affiliate || '',
});

export default function Poachers() {
  const [poachers, setPoachers] = useState([]);
  const [query, setQuery] = useState('');
  const [threat, setThreat] = useState('');
  const [captured, setCaptured] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const load = async () => {
    try {
      setError('');
      const params = {};
      if (threat) params.threat_level = threat;
      if (captured) params.is_captured = captured === 'true';
      const { data } = await poachersApi.getAll(params);
      setPoachers(data || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load poachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [threat, captured]);

  const visible = useMemo(() =>
    poachers.filter((p) =>
      `${p.alias || ''} ${p.description || ''} ${p.known_affiliate || ''} ${p.target_species || ''}`.toLowerCase().includes(query.toLowerCase())
    ), [poachers, query]
  );

  const activePoachers = visible.filter((p) => p.latitude && p.longitude && !p.is_captured);
  const poacherHotspots = activePoachers.map(poacherToHotspot);

  const create = async (ev) => {
    ev.preventDefault();
    try {
      await poachersApi.create({
        ...form,
        estimated_age: form.estimated_age ? Number(form.estimated_age) : null,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
      setCreateOpen(false);
      setForm(blank);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to create record.');
    }
  };

  const markCaptured = async (id) => {
    try {
      await poachersApi.update(id, { is_captured: true });
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to update.');
    }
  };

  if (loading) return <div className="text-center py-10">Loading watchlist...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Poacher Watchlist</h1>
          <p className="text-sm text-gray-500">Known and suspected poachers in Zimbabwe</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm">Refresh</button>
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add to watchlist
          </button>
        </div>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="card-zim">
        <OpenLayersMap
          hotspots={poacherHotspots}
          height="20rem"
          zoom={6}
          center={[29.5, -19.0]}
          scrollWheelZoom={true}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search watchlist..." className="w-full pl-10 pr-4 py-2 border rounded-xl" />
        </div>
        <select value={threat} onChange={(e) => setThreat(e.target.value)} className="px-4 py-2 border rounded-xl">
          <option value="">All threat levels</option>
          {['critical', 'high', 'medium', 'low'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={captured} onChange={(e) => setCaptured(e.target.value)} className="px-4 py-2 border rounded-xl">
          <option value="">All</option>
          <option value="false">At large</option>
          <option value="true">Captured</option>
        </select>
      </div>

      <div className="space-y-3">
        {visible.map((p) => (
          <article key={p.id} className={`card-zim ${p.is_captured ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: threatColors[p.threat_level] + '20' }}>
                  <Skull size={20} style={{ color: threatColors[p.threat_level] }} />
                </div>
                <div>
                  <div className="flex gap-3 items-center">
                    <h2 className="font-semibold text-zim-800">{p.alias || 'Unknown alias'}</h2>
                    <span className={threatBadges[p.threat_level]}>{p.threat_level} threat</span>
                    {p.is_captured && <span className="badge-low">Captured</span>}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{p.description || 'No description'}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {p.known_affiliate && <span>Affiliate: {p.known_affiliate} · </span>}
                    {p.target_species && <span>Targets: {p.target_species} · </span>}
                    {p.methods_used && <span>Methods: {p.methods_used}</span>}
                  </p>
                  {p.identifying_marks && <p className="text-sm text-gray-500">Marks: {p.identifying_marks}</p>}
                </div>
              </div>
              <div className="text-right">
                {p.last_seen && <p className="text-xs text-gray-400">Last seen: {new Date(p.last_seen).toLocaleDateString()}</p>}
                {!p.is_captured && (
                  <button onClick={() => markCaptured(p.id)} className="mt-2 text-sm text-green-700 border border-green-200 rounded-lg px-3 py-1">
                    Mark captured
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
        {!visible.length && <p className="text-center text-gray-500 py-10">No records found.</p>}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add to Watchlist">
        <form onSubmit={create} className="grid gap-3">
          <input required value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} placeholder="Alias / code name" className="border rounded-xl px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.threat_level} onChange={(e) => setForm({ ...form, threat_level: e.target.value })} className="border rounded-xl px-3 py-2">
              {['low', 'medium', 'high', 'critical'].map((t) => <option key={t} value={t}>{t} threat</option>)}
            </select>
            <input type="number" value={form.estimated_age} onChange={(e) => setForm({ ...form, estimated_age: e.target.value })} placeholder="Est. age" className="border rounded-xl px-3 py-2" />
          </div>
          <input value={form.known_affiliate} onChange={(e) => setForm({ ...form, known_affiliate: e.target.value })} placeholder="Known affiliate/group" className="border rounded-xl px-3 py-2" />
          <input value={form.target_species} onChange={(e) => setForm({ ...form, target_species: e.target.value })} placeholder="Target species" className="border rounded-xl px-3 py-2" />
          <input value={form.methods_used} onChange={(e) => setForm({ ...form, methods_used: e.target.value })} placeholder="Methods used" className="border rounded-xl px-3 py-2" />
          <input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} placeholder="Nationality" className="border rounded-xl px-3 py-2" />
          <input value={form.identifying_marks} onChange={(e) => setForm({ ...form, identifying_marks: e.target.value })} placeholder="Identifying marks" className="border rounded-xl px-3 py-2" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="border rounded-xl px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="Last known lat" className="border rounded-xl px-3 py-2" />
            <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="Last known lng" className="border rounded-xl px-3 py-2" />
          </div>
          <button className="btn-primary justify-center">Save record</button>
        </form>
      </Modal>
    </div>
  );
}
