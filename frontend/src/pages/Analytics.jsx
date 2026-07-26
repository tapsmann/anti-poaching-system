import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { predictionsApi, statsApi } from '../api/endpoints';
import IncidentMap from '../components/maps/IncidentMap';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [error, setError] = useState('');
  const hotspotRows = useMemo(() => [...heatmap].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5), [heatmap]);

  const load = useCallback(async () => {
    try {
      setError('');
      const [analyticsResponse, heatmapResponse] = await Promise.all([statsApi.analytics(), predictionsApi.heatmap({ grid_size: 7 })]);
      setAnalytics(analyticsResponse.data);
      setHeatmap(heatmapResponse.data.cells || []);
    } catch (requestError) { setError(requestError.response?.data?.detail || 'Unable to load analytics.'); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ analytics, heatmap }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'zimparks-analytics.json'; link.click(); URL.revokeObjectURL(url);
  };
  if (!analytics && !error) return <div className="text-center py-10">Loading analytics…</div>;
  if (error) return <div className="card-zim text-red-700">{error}<button onClick={load} className="ml-3 underline">Retry</button></div>;
  const metrics = [['Resolution rate', `${analytics.resolution_rate}%`], ['Average response', `${analytics.avg_response_time_mins} min`], ['Active patrols', analytics.active_patrols], ['Model hotspots', heatmap.length]];
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-zim-800">Analytics & Risk Intelligence</h1><p className="text-sm text-gray-500">Backend incident history and Python model predictions</p></div><button onClick={exportJson} className="btn-gold flex items-center gap-2"><Download size={18} /> Export JSON</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{metrics.map(([label, value]) => <div className="card-zim" key={label}><p className="text-sm text-gray-500">{label}</p><p className="text-3xl font-bold text-zim-800 mt-1">{value}</p></div>)}</div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><section className="card-zim"><h2 className="text-lg font-semibold text-zim-800 mb-4">Incident Trend</h2><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.poaching_trends}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#2f6b4f" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></section><section className="card-zim"><h2 className="text-lg font-semibold text-zim-800 mb-4">ML Risk Heatmap</h2><IncidentMap incidents={analytics.recent_incidents} hotspots={heatmap} height="18rem" /><ol className="mt-4 space-y-1 text-sm text-gray-600">{hotspotRows.map((spot, index) => <li key={`${spot.lat}-${spot.lng}`}><span className="font-medium text-red-700">#{index + 1} {Math.round(spot.risk_score)}%</span> risk at {spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}</li>)}</ol></section></div></div>;
};

export default Analytics;
