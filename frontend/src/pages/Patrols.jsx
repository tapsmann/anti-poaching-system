import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, MapPin, Users } from 'lucide-react';
import { patrolsApi } from '../api/endpoints';

const Patrols = () => {
  const [patrols, setPatrols] = useState([]);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const { data } = await patrolsApi.getAll();
      setPatrols(data || []);
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

  const visible = patrols.filter((p) => tab === 'active' ? p.status === 'active' || p.status === 'planned' : p.status === 'completed');

  if (loading) return <div className="text-center py-10">Loading patrols…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Patrol Tracking</h1>
          <p className="text-sm text-gray-500">Routes and status are supplied by the backend</p>
        </div>
        <button onClick={load} className="btn-primary">Refresh</button>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="flex gap-3 border-b border-earth-200">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 ${tab === 'active' ? 'border-b-2 border-zim-600 text-zim-700' : 'text-gray-500'}`}
        >
          Active & planned ({patrols.filter((p) => p.status !== 'completed').length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 ${tab === 'completed' ? 'border-b-2 border-zim-600 text-zim-700' : 'text-gray-500'}`}
        >
          Completed ({patrols.filter((p) => p.status === 'completed').length})
        </button>
      </div>

      <div className="space-y-4">
        {visible.map((p) => (
          <article key={p.id} className="card-zim">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="font-semibold text-zim-800">
                  Patrol #{p.id} · {p.protected_area_name || 'Unassigned area'}
                </h2>
                <p className="mt-1 text-sm text-gray-600 flex items-center gap-1">
                  <Users size={14} /> {p.ranger_name || 'Unassigned ranger'} · {p.patrol_type?.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock size={14} /> Started {new Date(p.start_time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <MapPin size={14} className="inline" /> {p.notes || p.objectives || 'No patrol notes.'}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-earth-100 px-3 py-1 text-xs font-semibold uppercase">
                  {p.status}
                </span>
                <p className="mt-3 text-sm">
                  {p.area_covered_km2 ? `${p.area_covered_km2.toFixed(1)} km²` : 'Coverage not recorded'}
                </p>
                {p.status !== 'completed' && (
                  <button
                    onClick={() => complete(p.id)}
                    className="mt-3 text-sm text-green-700 border border-green-200 rounded-lg px-3 py-1"
                  >
                    <CheckCircle size={14} className="inline" /> Complete
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
        {!visible.length && <p className="text-gray-500">No patrols in this view.</p>}
      </div>
    </div>
  );
};

export default Patrols;
