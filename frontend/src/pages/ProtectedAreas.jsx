import React, { useEffect, useState } from 'react';
import { Search, TreePine } from 'lucide-react';
import { protectedAreasApi, statsApi } from '../api/endpoints';
import Modal from '../components/common/Modal';
import OpenLayersMap from '../components/maps/OpenLayersMap';

const zoneColors = {
  national_park: '#1a5c2a',
  game_reserve: '#c9a84c',
  wildlife_sanctuary: '#2563eb',
  conservation_area: '#7c3aed',
  private_reserve: '#dc2626',
};

export default function ProtectedAreas() {
  const [areas, setAreas] = useState([]);
  const [incidentsByPark, setIncidentsByPark] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      setError('');
      const [aRes, sRes] = await Promise.all([
        protectedAreasApi.getAll(),
        statsApi.dashboard(),
      ]);
      setAreas(aRes.data || []);
      setIncidentsByPark(sRes.data.incidents_by_park || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load protected areas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = areas.filter((a) =>
    `${a.name} ${a.zone_type || ''} ${a.description || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  const getIncidentCount = (parkName) => {
    const found = incidentsByPark.find((p) => p.park === parkName);
    return found ? found.count : 0;
  };

  if (loading) return <div className="text-center py-10">Loading protected areas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Protected Areas</h1>
          <p className="text-sm text-gray-500">National parks, game reserves, and conservation areas in Zimbabwe</p>
        </div>
        <button onClick={load} className="btn-primary">Refresh</button>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="card-zim">
        <OpenLayersMap
          parks={visible}
          incidents={[]}
          className="h-56 sm:h-64 md:h-80 lg:h-[28rem]"
          zoom={6}
          center={[29.5, -19.0]}
          scrollWheelZoom={true}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search protected areas..."
          className="w-full pl-10 pr-4 py-2 border border-earth-200 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((area) => (
          <article
            key={area.id}
            className="card-zim cursor-pointer hover:border-zim-300"
            onClick={() => setSelected(area)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: (zoneColors[area.zone_type] || '#666') + '20' }}>
                <TreePine size={20} style={{ color: zoneColors[area.zone_type] || '#666' }} />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-zim-800">{area.name}</h2>
                <p className="text-xs text-gray-500 capitalize">{area.zone_type?.replace('_', ' ')}</p>
                <div className="mt-2 flex gap-2">
                  <span className="badge-medium">{area.risk_level || 'unknown'} risk</span>
                  <span className="badge-low">{getIncidentCount(area.name)} incidents</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {(area.size_hectares / 100).toFixed(1)} km\u00b2 · {area.description?.slice(0, 80)}...
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name || 'Protected Area'}>
        {selected && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{selected.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><strong>Type:</strong> {selected.zone_type?.replace('_', ' ')}</div>
              <div><strong>Risk:</strong> {selected.risk_level}</div>
              <div><strong>Size:</strong> {(selected.size_hectares / 100).toFixed(1)} km\u00b2</div>
              <div><strong>Incidents:</strong> {getIncidentCount(selected.name)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
