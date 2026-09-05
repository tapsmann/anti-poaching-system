import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, PawPrint, Users, Shield, RefreshCw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { statsApi, protectedAreasApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import OpenLayersMap from "../components/maps/OpenLayersMap";

const severityClass = (severity) => ({
  critical: "border-red-500 bg-red-50",
  high: "border-orange-500 bg-orange-50",
  medium: "border-yellow-500 bg-yellow-50",
  low: "border-green-500 bg-green-50"
}[severity?.toLowerCase()] || "border-gray-400 bg-gray-50");

const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

const Dashboard = () => {
  const { ranger, isRanger } = useAuth();
  const [data, setData] = useState({
    total_incidents: 0, active_reports: 0, rangers_on_duty: 0,
    species_protected: 0, active_patrols: 0, resolved_count: 0, unresolved_count: 0,
    incidents_by_park: [], incidents_by_type: [], incidents_by_severity: [],
    recent_incidents: [], hotspots: [], poaching_trends: [],
  });
  const [areas, setAreas] = useState([]);
  const [parkFilter, setParkFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const params = {};
      if (parkFilter) params.park = parkFilter;
      const [res, areasRes] = await Promise.all([
        statsApi.dashboard(params),
        protectedAreasApi.getAll(),
      ]);
      const d = res.data;
      setData({
        total_incidents: d.total_incidents || 0,
        active_reports: d.active_reports || 0,
        rangers_on_duty: d.rangers_on_duty || 0,
        species_protected: d.species_protected || 0,
        active_patrols: d.active_patrols || 0,
        resolved_count: d.resolved_count || 0,
        unresolved_count: d.unresolved_count || 0,
        incidents_by_park: d.incidents_by_park || [],
        incidents_by_type: d.incidents_by_type || [],
        incidents_by_severity: d.incidents_by_severity || [],
        recent_incidents: d.recent_incidents || [],
        hotspots: d.hotspots || [],
        poaching_trends: d.poaching_trends || [],
      });
      setAreas(areasRes.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load dashboard.");
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

  if (loading && !data.total_incidents) {
    return <div className="text-center py-10">Loading live dashboard...</div>;
  }

  const cards = [
    ["Total Incidents", data.total_incidents, AlertTriangle, "text-red-600 bg-red-50"],
    ["Active Reports", data.active_reports, CheckCircle, "text-amber-600 bg-amber-50"],
    ["Rangers on Duty", data.rangers_on_duty, Users, "text-green-600 bg-green-50"],
    ["Species Protected", data.species_protected, PawPrint, "text-blue-600 bg-blue-50"],
    ["Active Patrols", data.active_patrols, Shield, "text-purple-600 bg-purple-50"],
    ["Resolved", data.resolved_count, CheckCircle, "text-emerald-600 bg-emerald-50"],
  ];

  const pieData = (data.incidents_by_severity || []).map((s) => ({
    name: s.severity?.charAt(0).toUpperCase() + s.severity?.slice(1),
    value: s.count,
    fill: SEVERITY_COLORS[s.severity] || '#999',
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Operations Dashboard</h1>
          <p className="text-sm text-gray-500">
            {parkFilter ? `Showing data for ${parkFilter}` : 'All Zimbabwe parks'}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={parkFilter}
            onChange={(e) => setParkFilter(e.target.value)}
            disabled={isRanger}
            title={isRanger ? "Locked to your assigned park" : "Filter by park"}
            className="text-sm border border-zim-200 rounded-lg px-3 py-2 disabled:opacity-60"
          >
            {!isRanger && <option value="">All parks</option>}
            {areas
              .filter((a) => !isRanger || a.name === ranger?.assigned_area_name)
              .map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
          <button onClick={load} className="text-sm text-zim-700 border border-zim-200 rounded-lg px-3 py-2 hover:bg-zim-50 flex items-center gap-1">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="card-zim text-red-700">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(([title, value, Icon, style]) => (
          <div key={title} className="stat-card">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-zim-800 mt-1">{value}</p>
              </div>
              <div className={`p-2 rounded-xl ${style}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">Zimbabwe Risk Map</h2>
          <OpenLayersMap incidents={data.recent_incidents} hotspots={data.hotspots} height="22rem" />
          <p className="mt-3 text-xs text-gray-500">
            Markers show reported incidents; colored circles are ML-predicted risk zones across parks.
          </p>
        </section>

        <section className="card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">Incidents by Park</h2>
          <div className="space-y-3">
            {data.incidents_by_park && data.incidents_by_park.length > 0 ? (
              data.incidents_by_park.map((park, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{park.park || "Unknown"}</span>
                    <span>{park.count || 0} ({park.percentage || 0}%)</span>
                  </div>
                  <div className="mt-1 h-2 bg-earth-200 rounded-full">
                    <div
                      className="h-2 rounded-full bg-zim-600"
                      style={{ width: `${Math.min(park.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No incident data yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">Incident Trends</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.poaching_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1a5c2a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">By Severity</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </section>

        <section className="card-zim">
          <h2 className="text-lg font-semibold text-zim-800 mb-4">By Type</h2>
          <div className="space-y-3">
            {data.incidents_by_type && data.incidents_by_type.length > 0 ? (
              data.incidents_by_type.map((t, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{t.type}</span>
                    <span>{t.count}</span>
                  </div>
                  <div className="mt-1 h-2 bg-earth-200 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min((t.count / (data.total_incidents || 1)) * 100, 100)}%`,
                        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][i % 6],
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No data yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="card-zim">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zim-800">Recent Incidents</h2>
          <Link to="/incidents" className="text-sm text-zim-700 font-medium">View all \u2192</Link>
        </div>
        <div className="space-y-3">
          {data.recent_incidents && data.recent_incidents.length > 0 ? (
            data.recent_incidents.map((incident, index) => (
              <article
                key={index}
                className={`border-l-4 rounded-r-xl p-3 ${severityClass(incident.severity)}`}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-zim-900">
                      {incident.incident_type?.replaceAll("_", " ") || "Unknown incident"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {incident.protected_area_name || "Unassigned area"} · {" "}
                      {incident.ranger_name || "Unassigned ranger"}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {incident.description || "No description provided."}
                    </p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-xs text-gray-500">
                      {incident.timestamp ? new Date(incident.timestamp).toLocaleDateString() : "Unknown"}
                    </span>
                    {incident.risk_score > 0 && (
                      <p className="text-sm font-bold text-red-600 mt-1">{Math.round(incident.risk_score)}% risk</p>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No incidents recorded.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
