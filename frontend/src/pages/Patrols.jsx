import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, MapPin, Plus, Users, Trash2 } from 'lucide-react';
import { patrolsApi, rangersApi, protectedAreasApi } from '../api/endpoints';
import Modal from '../components/common/Modal';
import OpenLayersMap from '../components/maps/OpenLayersMap';

const patrolTypes = ['routine', 'intelligence_led', 'rapid_response', 'community_patrol', 'aerial_surveillance'];
const blankForm = {
  ranger_id: '', protected_area_id: '', patrol_type: 'routine', objectives: '',
  area_covered_km2: '', notes: '',
};

const Patrols = () => {
  const [patrols, setPatrols] = useState([]);
  const [rangers, setRangers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [routePoints, setRoutePoints] = useState([]);
  const [selectedPatrol, setSelectedPatrol] = useState(null);
  const [mapCenter, setMapCenter] = useState([29.5, -19.0]);
  const [mapZoom, setMapZoom] = useState(6);

  const load = async () => {
    try {
      setError('');
      const [pRes, rRes, aRes] = await Promise.all([
        patrolsApi.getAll(), rangersApi.getAll(), protectedAreasApi.getAll()
      ]);
      setPatrols(pRes.data || []);
      setRangers(rRes.data || []);
      setAreas(aRes.data || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load patrols.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const complete = async (id) => {
    try {
      await patrolsApi.complete(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to complete patrol.');
    }
  };

  const create = async (ev) => {
    ev.preventDefault();
    if (routePoints.length < 2) {
      setError('Click the map to add at least 2 route points.');
      return;
    }
    try {
      await patrolsApi.create({
        ...form,
        ranger_id: Number(form.ranger_id),
        protected_area_id: form.protected_area_id ? Number(form.protected_area_id) : null,
        area_covered_km2: form.area_covered_km2 ? Number(form.area_covered_km2) : null,
        route: routePoints.map((pt) => ({ lat: pt.lat, lng: pt.lng })),
        start_time: new Date().toISOString(),
      });
      setCreateOpen(false);
      setForm(blankForm);
      setRoutePoints([]);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to create patrol.');
    }
  };

  const visible = patrols.filter((p) => tab === 'active' ? p.status !== 'completed' : p.status === 'completed');

  const displayRoute = selectedPatrol?.route || [];

  if (loading) return <div className="text-center py-10">Loading patrols...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Patrol Tracking</h1>
          <p className="text-sm text-gray-500">{patrols.length} total patrols</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} className="btn-outline text-sm">Refresh</button>
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New patrol
          </button>
        </div>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="flex gap-3 border-b border-earth-200">
        <button onClick={() => setTab('active')}
          className={`px-4 py-2 ${tab === 'active' ? 'border-b-2 border-zim-600 text-zim-700 font-medium' : 'text-gray-500'}`}>
          Active & planned ({patrols.filter((p) => p.status !== 'completed').length})
        </button>
        <button onClick={() => setTab('completed')}
          className={`px-4 py-2 ${tab === 'completed' ? 'border-b-2 border-zim-600 text-zim-700 font-medium' : 'text-gray-500'}`}>
          Completed ({patrols.filter((p) => p.status === 'completed').length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {visible.map((p) => (
            <article
              key={p.id}
              className={`card-zim cursor-pointer transition-all ${selectedPatrol?.id === p.id ? 'border-zim-500 ring-2 ring-zim-200' : 'hover:border-zim-300'}`}
              onClick={() => setSelectedPatrol(p)}
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-semibold text-zim-800">
                    Patrol #{p.id} · {p.protected_area_name || 'Unassigned area'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 flex items-center gap-1">
                    <Users size={14} /> {p.ranger_name || 'Unassigned ranger'} · {p.patrol_type?.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock size={14} /> Started {new Date(p.start_time).toLocaleString()}
                    {p.end_time && <span> · Ended {new Date(p.end_time).toLocaleString()}</span>}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <MapPin size={14} className="inline" /> {p.objectives || p.notes || 'No objectives.'}
                  </p>
                  {p.route && p.route.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-zim-700 bg-zim-50 rounded-full px-2 py-0.5 mt-2">
                      <MapPin size={10} /> {p.route.length} route points
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-earth-100 px-3 py-1 text-xs font-semibold uppercase">{p.status}</span>
                  <p className="mt-3 text-sm">{p.area_covered_km2 ? `${p.area_covered_km2.toFixed(1)} km\u00b2` : 'No coverage data'}</p>
                  {p.status !== 'completed' && (
                    <button onClick={(e) => { e.stopPropagation(); complete(p.id); }} className="mt-3 text-sm text-green-700 border border-green-200 rounded-lg px-3 py-1">
                      <CheckCircle size={14} className="inline" /> Complete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
          {!visible.length && <p className="text-gray-500 text-center py-10">No patrols in this view.</p>}
        </div>

        <div className="space-y-4">
          <div className="card-zim">
            <h3 className="font-semibold text-zim-800 mb-3">
              {selectedPatrol ? `Patrol #${selectedPatrol.id} Route` : 'Select a patrol'}
            </h3>
            <OpenLayersMap
              incidents={[]}
              hotspots={[]}
              route={displayRoute.map((pt) => ({ lat: pt.lat, lng: pt.lng }))}
              className="h-48 sm:h-64 md:h-72 lg:h-96"
              zoom={mapZoom}
              center={mapCenter}
              scrollWheelZoom={false}
            />
            {selectedPatrol && (
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p><strong>Ranger:</strong> {selectedPatrol.ranger_name || 'Unassigned'}</p>
                <p><strong>Type:</strong> {selectedPatrol.patrol_type?.replace(/_/g, ' ')}</p>
                <p><strong>Status:</strong> {selectedPatrol.status}</p>
                {selectedPatrol.area_covered_km2 && <p><strong>Coverage:</strong> {selectedPatrol.area_covered_km2} km\u00b2</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setRoutePoints([]); }} title="Create Patrol" wide>
        <form onSubmit={create} className="grid gap-3">
          <OpenLayersMap
            route={routePoints}
            drawingMode={true}
            onMapClick={(pt) => setRoutePoints((prev) => [...prev, pt])}
            className="h-40 sm:h-48 md:h-56 lg:h-72"
            zoom={6}
            scrollWheelZoom={true}
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Click the map to draw the patrol route ({routePoints.length} points)</span>
            {routePoints.length > 0 && (
              <button type="button" onClick={() => setRoutePoints([])} className="text-red-500 flex items-center gap-1">
                <Trash2 size={12} /> Clear route
              </button>
            )}
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select required value={form.ranger_id} onChange={(e) => setForm({ ...form, ranger_id: e.target.value })} className="w-full border rounded-xl px-3 py-2">
              <option value="">Select ranger</option>
              {rangers.filter((r) => r.is_active).map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.assigned_area_name || 'Unassigned'})</option>
              ))}
            </select>
            <select value={form.protected_area_id} onChange={(e) => {
            setForm({ ...form, protected_area_id: e.target.value });
            const selectedArea = areas.find((a) => a.id === Number(e.target.value));
            if (selectedArea) {
              setMapCenter([selectedArea.center_lng, selectedArea.center_lat]);
              setMapZoom(8);
            }
          }} className="w-full border rounded-xl px-3 py-2">
              <option value="">Select park</option>
              {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <select value={form.patrol_type} onChange={(e) => setForm({ ...form, patrol_type: e.target.value })} className="w-full border rounded-xl px-3 py-2">
            {patrolTypes.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <input value={form.area_covered_km2} onChange={(e) => setForm({ ...form, area_covered_km2: e.target.value })} placeholder="Area covered (km²)" className="w-full border rounded-xl px-3 py-2" />
          <textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} placeholder="Patrol objectives" className="w-full border rounded-xl px-3 py-2" />
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="w-full border rounded-xl px-3 py-2" />
          <button className="btn-primary justify-center">Create patrol</button>
        </form>
      </Modal>
    </div>
  );
};

export default Patrols;
