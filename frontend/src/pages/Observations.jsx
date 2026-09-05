import React, { useEffect, useMemo, useState } from 'react';
import { Eye, MapPin, Plus, Search } from 'lucide-react';
import { observationsApi, patrolsApi, speciesApi } from '../api/endpoints';
import Modal from '../components/common/Modal';

const observationTypes = [
  'poaching_sign', 'animal_sighting', 'suspicious_activity',
  'snare_found', 'track_found', 'carcass_found', 'illegal_camp', 'fire_detected'
];
const severityColors = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

const blank = {
  patrol_id: '', observation_type: 'animal_sighting', latitude: '-19.0', longitude: '29.5',
  description: '', animal_count: '', severity: 'low'
};

export default function Observations() {
  const [observations, setObservations] = useState([]);
  const [patrols, setPatrols] = useState([]);
  const [species, setSpecies] = useState([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const load = async () => {
    try {
      setError('');
      const [oRes, pRes, sRes] = await Promise.all([
        observationsApi.getAll(), patrolsApi.getAll(), speciesApi.getAll()
      ]);
      setObservations(oRes.data || []);
      setPatrols(pRes.data || []);
      setSpecies(sRes.data || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load observations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() =>
    observations.filter((o) =>
      (!typeFilter || o.observation_type === typeFilter) &&
      `${o.description || ''} ${o.observation_type}`.toLowerCase().includes(query.toLowerCase())
    ), [observations, query, typeFilter]
  );

  const create = async (ev) => {
    ev.preventDefault();
    try {
      await observationsApi.create({
        ...form,
        patrol_id: Number(form.patrol_id),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        animal_count: form.animal_count ? Number(form.animal_count) : null,
      });
      setCreateOpen(false);
      setForm(blank);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to create observation.');
    }
  };

  if (loading) return <div className="text-center py-10">Loading observations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Patrol Observations</h1>
          <p className="text-sm text-gray-500">Sightings, snares, tracks, and threats logged during patrols</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm">Refresh</button>
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Log observation
          </button>
        </div>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search observations..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 border rounded-xl">
          <option value="">All types</option>
          {observationTypes.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {visible.map((o) => (
          <article key={o.id} className="card-zim">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="flex gap-3 items-center">
                  <h2 className="font-semibold text-zim-800">{o.observation_type.replace('_', ' ')}</h2>
                  {o.severity && <span className={severityColors[o.severity]}>{o.severity}</span>}
                  {o.animal_count && <span className="badge-low">{o.animal_count} animals</span>}
                </div>
                <p className="mt-2 text-sm text-gray-700">{o.description || 'No description'}</p>
                <p className="mt-2 text-sm text-gray-500 flex gap-4">
                  <span className="flex gap-1"><MapPin size={14} />{o.latitude?.toFixed(4)}, {o.longitude?.toFixed(4)}</span>
                  <span>Patrol #{o.patrol_id}</span>
                  <span>{new Date(o.created_at || o.timestamp).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </article>
        ))}
        {!visible.length && <p className="text-center text-gray-500 py-10">No observations found.</p>}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Log Observation">
        <form onSubmit={create} className="grid gap-3">
          <select required value={form.patrol_id} onChange={(e) => setForm({ ...form, patrol_id: e.target.value })} className="border rounded-xl px-3 py-2">
            <option value="">Select patrol</option>
            {patrols.filter((p) => p.status !== 'completed').map((p) => (
              <option key={p.id} value={p.id}>Patrol #{p.id} - {p.protected_area_name || 'Unknown'}</option>
            ))}
          </select>
          <select value={form.observation_type} onChange={(e) => setForm({ ...form, observation_type: e.target.value })} className="border rounded-xl px-3 py-2">
            {observationTypes.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="Latitude" className="border rounded-xl px-3 py-2" />
            <input required type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="Longitude" className="border rounded-xl px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.animal_count} onChange={(e) => setForm({ ...form, animal_count: e.target.value })} placeholder="Animal count" className="border rounded-xl px-3 py-2" />
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="border rounded-xl px-3 py-2">
              {['low', 'medium', 'high', 'critical'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="border rounded-xl px-3 py-2" />
          <button className="btn-primary justify-center">Save observation</button>
        </form>
      </Modal>
    </div>
  );
}
