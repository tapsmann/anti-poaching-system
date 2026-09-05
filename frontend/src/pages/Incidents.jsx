import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, Plus, Search, User, AlertTriangle } from 'lucide-react';
import { incidentsApi, protectedAreasApi, rangersApi, speciesApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import OpenLayersMap from '../components/maps/OpenLayersMap';

const types = ['poaching', 'trespassing', 'illegal_logging', 'wildfire', 'human_wildlife_conflict', 'suspicious_activity'];
const severities = ['low', 'medium', 'high', 'critical'];
const badge = (severity) => ({ critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }[severity] || 'badge-medium');

const blank = {
  incident_type: 'poaching', severity: 'medium', latitude: '-19.0', longitude: '29.5',
  description: '', protected_area_id: '', species_id: '', poacher_count: '0'
};

export default function Incidents() {
  const { ranger, isRanger, isSupervisor } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [rangers, setRangers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [species, setSpecies] = useState([]);
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState('');
  const [sevFilter, setSevFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [form, setForm] = useState(blank);
  const [mapPos, setMapPos] = useState(null);

  const load = async () => {
    try {
      setError('');
      const [i, r, a, s] = await Promise.all([
        incidentsApi.getAll(), rangersApi.getAll(), protectedAreasApi.getAll(), speciesApi.getAll()
      ]);
      setIncidents(i.data || []);
      setRangers(r.data || []);
      setAreas(a.data || []);
      setSpecies(s.data || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load incident data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (isRanger && ranger?.assigned_area_id) {
      setArea(String(ranger.assigned_area_id));
      setForm((f) => ({ ...f, protected_area_id: String(ranger.assigned_area_id) }));
    }
  }, [isRanger, ranger?.assigned_area_id]);

  const visible = useMemo(() =>
    incidents.filter((i) =>
      (!area || String(i.protected_area_id) === area) &&
      (!type || i.incident_type === type) &&
      (!sevFilter || i.severity === sevFilter) &&
      `${i.incident_type} ${i.description || ''} ${i.protected_area_name || ''}`.toLowerCase().includes(query.toLowerCase())
    ), [incidents, area, type, sevFilter, query]
  );

  const create = async (event) => {
    event.preventDefault();
    try {
      await incidentsApi.create({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        protected_area_id: form.protected_area_id ? Number(form.protected_area_id) : null,
        species_id: form.species_id ? Number(form.species_id) : null,
        poacher_count: Number(form.poacher_count) || 0,
      });
      setCreateOpen(false);
      setForm(blank);
      setMapPos(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to create incident.');
    }
  };

  const assign = async (rangerId) => {
    try {
      await incidentsApi.assign(assigning.id, rangerId);
      setAssigning(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to assign ranger.');
    }
  };

  const resolve = async (id) => {
    try {
      await incidentsApi.resolve(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to resolve incident.');
    }
  };

  useEffect(() => {
    if (mapPos) {
      setForm((f) => ({ ...f, latitude: String(mapPos.lat.toFixed(6)), longitude: String(mapPos.lng.toFixed(6)) }));
    }
  }, [mapPos]);

  if (loading) return <div className="text-center py-10">Loading incidents...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Incident Management</h1>
          <p className="text-sm text-gray-500">{visible.length} incidents recorded</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New incident
        </button>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search incidents..." className="w-full pl-10 pr-4 py-2 border rounded-xl" />
        </div>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          disabled={isRanger}
          title={isRanger ? "Locked to your assigned park" : "Filter by park"}
          className="px-4 py-2 border rounded-xl disabled:opacity-60"
        >
          {!isRanger && <option value="">All parks</option>}
          {areas
            .filter((a) => !isRanger || a.id === ranger?.assigned_area_id)
            .map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2 border rounded-xl">
          <option value="">All types</option>
          {types.map((t) => <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>)}
        </select>
        <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value)} className="px-4 py-2 border rounded-xl">
          <option value="">All severity</option>
          {severities.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {visible.map((i) => (
          <article key={i.id} className="card-zim">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="flex gap-3 items-center">
                  <h2 className="font-semibold text-zim-800 capitalize">{i.incident_type.replaceAll('_', ' ')}</h2>
                  <span className={badge(i.severity)}>{i.severity} risk</span>
                  {i.is_resolved && <span className="badge-low">Resolved</span>}
                  {i.risk_score > 60 && <span className="badge-critical flex items-center gap-1"><AlertTriangle size={12} /> High risk</span>}
                </div>
                <p className="mt-2 text-sm flex gap-1">
                  <MapPin size={15} />
                  {i.protected_area_name || `${i.latitude?.toFixed(4)}, ${i.longitude?.toFixed(4)}`}
                </p>
                <p className="mt-2 text-sm">{i.description || 'No description provided.'}</p>
                <p className="mt-3 text-sm text-gray-500 flex gap-4">
                  <span className="flex gap-1"><User size={14} />{i.ranger_name || 'Unassigned'}</span>
                  <span className="flex gap-1"><Clock size={14} />{new Date(i.timestamp).toLocaleString()}</span>
                  {i.risk_score > 0 && <span className="font-bold text-red-600">Risk: {Math.round(i.risk_score)}%</span>}
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <button
                  onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${i.latitude}&mlon=${i.longitude}#map=14/${i.latitude}/${i.longitude}`, '_blank', 'noopener')}
                  className="text-sm border rounded-lg px-3 py-1"
                >
                  Map
                </button>
                {isSupervisor && (
                  <button onClick={() => setAssigning(i)} className="text-sm text-blue-700 border border-blue-200 rounded-lg px-3 py-1">
                    Assign
                  </button>
                )}
                {!i.is_resolved && (
                  <button onClick={() => resolve(i.id)} className="text-sm text-green-700 border border-green-200 rounded-lg px-3 py-1">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
        {!visible.length && <p className="text-center text-gray-500 py-10">No incidents match the filters.</p>}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Report Incident" wide>
        <form onSubmit={create} className="grid gap-3">
          <OpenLayersMap
            incidents={mapPos ? [{ id: 0, latitude: mapPos.lat, longitude: mapPos.lng }] : []}
            drawingMode={true}
            onMapClick={(pt) => setMapPos(pt)}
            height="16rem"
            className="h-40 sm:h-48 md:h-56 lg:h-64"
            zoom={mapPos ? 12 : 6}
            center={mapPos ? [mapPos.lng, mapPos.lat] : [29.5, -19.0]}
          />
          <p className="text-xs text-gray-400">Click the map to set incident location, or enter coordinates below.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.incident_type} onChange={(e) => setForm({ ...form, incident_type: e.target.value })}>
              {types.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {severities.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="Latitude" className="border rounded-xl px-3 py-2" />
            <input required type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="Longitude" className="border rounded-xl px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={form.protected_area_id}
              onChange={(e) => setForm({ ...form, protected_area_id: e.target.value })}
              disabled={isRanger}
              title={isRanger ? "Locked to your assigned park" : "Select park"}
              className="disabled:opacity-60"
            >
              {!isRanger && <option value="">No protected area</option>}
              {areas
                .filter((a) => !isRanger || a.id === ranger?.assigned_area_id)
                .map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={form.species_id} onChange={(e) => setForm({ ...form, species_id: e.target.value })}>
              <option value="">No species</option>
              {species.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <input type="number" value={form.poacher_count} onChange={(e) => setForm({ ...form, poacher_count: e.target.value })} placeholder="Number of poachers" className="border rounded-xl px-3 py-2" />
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description of incident" className="border rounded-xl px-3 py-2" />
          <button className="btn-primary justify-center">Report incident</button>
        </form>
      </Modal>

      <Modal isOpen={Boolean(assigning)} onClose={() => setAssigning(null)} title="Assign ranger">
        <div className="space-y-2">
          {rangers.filter((r) => r.is_active).map((r) => (
            <button key={r.id} onClick={() => assign(r.id)} className="block w-full text-left border rounded-lg px-3 py-2 hover:bg-earth-50">
              {r.name} · {r.badge_number} · {r.assigned_area_name || 'Unassigned'}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
