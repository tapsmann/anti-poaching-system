import React, { useCallback, useEffect, useState } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, PawPrint, Users } from 'lucide-react';
import { statsApi } from '../api/endpoints';
import IncidentMap from '../components/maps/IncidentMap';

const severityClass = (severity) => ({ critical: 'border-red-500 bg-red-50', high: 'border-orange-500 bg-orange-50', medium: 'border-yellow-500 bg-yellow-50', low: 'border-green-500 bg-green-50' }[severity?.toLowerCase()] || 'border-gray-400 bg-gray-50');

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const response = await statsApi.dashboard();
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load the live dashboard.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!data && !error) return <div className="text-center py-10">Loading live dashboard…</div>;
  if (error) return <div className="card-zim text-red-700">{error}<button onClick={load} className="ml-3 underline font-medium">Retry</button></div>;

  const cards = [
    ['Total Incidents', data.total_incidents, AlertTriangle, 'text-red-600 bg-red-50'],
    ['Active Reports', data.active_reports, CheckCircle, 'text-amber-600 bg-amber-50'],
    ['Rangers on Duty', data.rangers_on_duty, Users, 'text-green-600 bg-green-50'],
    ['Species Protected', data.species_protected, PawPrint, 'text-blue-600 bg-blue-50'],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-zim-800">Operations Dashboard</h1><p className="text-sm text-gray-500">Live data from the anti-poaching backend</p></div>
        <button onClick={load} className="text-sm text-zim-700 border border-zim-200 rounded-lg px-3 py-2 hover:bg-zim-50">Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(([title, value, Icon, style]) => <div key={title} className="stat-card"><div className="flex justify-between"><div><p className="text-sm text-gray-500 font-medium">{title}</p><p className="text-3xl font-bold text-zim-800 mt-1">{value}</p></div><div className={`p-3 rounded-xl ${style}`}><Icon size={24} /></div></div></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 card-zim"><h2 className="text-lg font-semibold text-zim-800 mb-4">Zimbabwe Risk Map</h2><IncidentMap incidents={data.recent_incidents} hotspots={data.hotspots} /><p className="mt-3 text-xs text-gray-500">Markers show reported incidents; red circles are scores returned by the Python risk model.</p></section>
        <section className="card-zim"><h2 className="text-lg font-semibold text-zim-800 mb-4">Incidents by Park</h2><div className="space-y-4">{data.incidents_by_park.length ? data.incidents_by_park.map((park) => <div key={park.park}><div className="flex justify-between text-sm"><span className="font-medium">{park.park}</span><span>{park.count} ({park.percentage}%)</span></div><div className="mt-1 h-2 bg-earth-200 rounded-full"><div className="h-2 rounded-full bg-zim-600" style={{ width: `${park.percentage}%` }} /></div></div>) : <p className="text-sm text-gray-500">No incident data yet.</p>}</div></section>
      </div>
      <section className="card-zim"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-zim-800">Recent Incidents</h2><Link to="/incidents" className="text-sm text-zim-700 font-medium">View all →</Link></div><div className="space-y-3">{data.recent_incidents.length ? data.recent_incidents.map((incident) => <article key={incident.id} className={`border-l-4 rounded-r-xl p-3 ${severityClass(incident.severity)}`}><div className="flex justify-between gap-4"><div><p className="font-medium text-zim-900">{incident.incident_type.replaceAll('_', ' ')}</p><p className="text-sm text-gray-600">{incident.protected_area_name || 'Unassigned area'} · {incident.ranger_name || 'Unassigned ranger'}</p><p className="text-sm text-gray-700 mt-1">{incident.description || 'No description provided.'}</p></div><span className="text-xs text-gray-500 whitespace-nowrap">{new Date(incident.timestamp).toLocaleString()}</span></div></article>) : <p className="text-gray-500 text-sm">No incidents recorded.</p>}</div></section>
    </div>
  );
};

export default Dashboard;
