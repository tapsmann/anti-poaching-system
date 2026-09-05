import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, LineChart, Line } from 'recharts';
import { predictionsApi, statsApi, protectedAreasApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import OpenLayersMap from '../components/maps/OpenLayersMap';

const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

const Analytics = () => {
  const { ranger, isRanger } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [parkHeatmap, setParkHeatmap] = useState([]);
  const [areas, setAreas] = useState([]);
  const [parkFilter, setParkFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const hotspotRows = useMemo(() => [...heatmap].sort((a, b) => b.risk_score - a.risk_score).slice(0, 8), [heatmap]);

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const params = {};
      if (parkFilter) params.park = parkFilter;
      const [analyticsRes, heatmapRes, areasRes, parkHeatRes] = await Promise.all([
        statsApi.analytics(params),
        predictionsApi.heatmap({ grid_size: 7, ...(parkFilter ? { park: parkFilter } : {}) }),
        protectedAreasApi.getAll(),
        predictionsApi.parkHeatmap(),
      ]);
      setAnalytics(analyticsRes.data);
      setHeatmap(heatmapRes.data.cells || []);
      setAreas(areasRes.data || []);
      setParkHeatmap(parkHeatRes.data.cells || []);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [parkFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (isRanger && ranger?.assigned_area_name) {
      setParkFilter(ranger.assigned_area_name);
    }
  }, [isRanger, ranger?.assigned_area_name]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ analytics, heatmap, parkHeatmap }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'zimparks-analytics.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !analytics) return <div className="text-center py-10">Loading analytics...</div>;
  if (error) return <div className="card-zim text-red-700">{error}<button onClick={load} className="ml-3 underline">Retry</button></div>;

  const metrics = [
    ['Resolution rate', `${analytics?.resolution_rate || 0}%`],
    ['Average response', `${analytics?.avg_response_time_mins || 0} min`],
    ['Conviction rate', `${analytics?.conviction_rate || 0}%`],
    ['Active patrols', analytics?.active_patrols || 0],
    ['Patrol coverage', `${analytics?.patrol_coverage_km2 || 0} km\u00b2`],
    ['Community reports', analytics?.community_reports_this_month || 0],
    ['Model hotspots', heatmap.length],
    ['Total incidents', analytics?.total_incidents || 0],
  ];

  const severityPie = (analytics?.incidents_by_severity || []).map((s) => ({
    name: s.severity?.charAt(0).toUpperCase() + s.severity?.slice(1),
    value: s.count,
    fill: SEVERITY_COLORS[s.severity] || '#999',
  }));

  const typeBar = (analytics?.incidents_by_type || []);

  const parkIncidents = (analytics?.incidents_by_park || []);

  const parkRisk = areas.map((a) => {
    const areaShort = a.name.replace(' National Park', '').replace(' Park', '');
    const parkHotspots = parkHeatmap.filter((h) => h.park === areaShort);
    const avgRisk = parkHotspots.length > 0
      ? parkHotspots.reduce((sum, h) => sum + (h.risk_score || 0), 0) / parkHotspots.length
      : 0;
    return { name: areaShort, risk: Math.round(avgRisk) };
  }).filter((p) => p.risk > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Analytics & Risk Intelligence</h1>
          <p className="text-sm text-gray-500">ML predictions and incident analysis across Zimbabwe</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={parkFilter}
            onChange={(e) => setParkFilter(e.target.value)}
            disabled={isRanger}
            title={isRanger ? "Locked to your assigned park" : "Filter by park"}
            className="text-sm border rounded-lg px-3 py-2 disabled:opacity-60"
          >
            {!isRanger && <option value="">All parks</option>}
            {areas
              .filter((a) => !isRanger || a.name === ranger?.assigned_area_name)
              .map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
          <button onClick={exportJson} className="btn-gold flex items-center gap-2 text-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(([label, value]) => (
          <div className="card-zim" key={label}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-zim-800 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">ML Risk Heatmap</h2>
          <OpenLayersMap incidents={analytics?.recent_incidents || []} hotspots={heatmap} height="20rem" />
          <ol className="mt-4 space-y-1 text-sm text-gray-600">
            {hotspotRows.map((spot, index) => (
              <li key={`${spot.lat}-${spot.lng}`} className="flex justify-between">
                <span>
                  <span className="font-medium text-red-700">#{index + 1}</span>{' '}
                  {spot.park && <span className="text-gray-500">({spot.park})</span>}
                  {' '}{spot.lat.toFixed(3)}, {spot.lng.toFixed(3)}
                </span>
                <span className="font-bold" style={{ color: spot.risk_score >= 70 ? '#ef4444' : spot.risk_score >= 50 ? '#f97316' : '#eab308' }}>
                  {Math.round(spot.risk_score)}%
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">Incident Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.poaching_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1a5c2a" strokeWidth={2} dot={{ fill: '#1a5c2a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">By Severity</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityPie} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value">
                  {severityPie.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {severityPie.map((d) => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </section>

        <section className="card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">By Type</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeBar} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" fill="#2d6a3f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">Park Risk Scores</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parkRisk}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                  {parkRisk.map((entry, idx) => (
                    <Cell key={idx} fill={entry.risk >= 70 ? '#ef4444' : entry.risk >= 50 ? '#f97316' : entry.risk >= 30 ? '#eab308' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card-zim">
        <h2 className="text-lg font-semibold text-zim-800 mb-4">Incidents by Park</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parkIncidents.map((park, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{park.park}</span>
                <span>{park.count} ({park.percentage}%)</span>
              </div>
              <div className="mt-1 h-3 bg-earth-200 rounded-full">
                <div className="h-3 rounded-full" style={{
                  width: `${Math.min(park.percentage, 100)}%`,
                  backgroundColor: park.percentage > 30 ? '#ef4444' : park.percentage > 20 ? '#f97316' : '#1a5c2a',
                }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Analytics;
