import { useEffect, useMemo, useState } from 'react';
import { Search, Wifi } from 'lucide-react';
import { rangersApi } from '../api/endpoints';

const Rangers = () => {
  const [rangers, setRangers] = useState([]); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = async () => { try { setError(''); const { data } = await rangersApi.getAll(); setRangers(data || []); } catch (e) { setError(e.response?.data?.detail || 'Unable to load rangers.'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const visible = useMemo(() => rangers.filter((r) => `${r.name} ${r.badge_number} ${r.rank || ''}`.toLowerCase().includes(query.toLowerCase())), [rangers, query]);
  if (loading) return <div className="text-center py-10">Loading rangers…</div>;
  return <div className="space-y-6"><div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-zim-800">Rangers</h1><p className="text-sm text-gray-500">Live ranger roster from the backend</p></div><button onClick={load} className="btn-primary">Refresh</button></div>{error && <p className="card-zim text-red-700">{error}</p>}<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rangers…" className="w-full pl-10 pr-4 py-2 border border-earth-200 rounded-xl" /></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{visible.map((ranger) => <article key={ranger.id} className="card-zim"><div className="flex gap-4"><div className="w-12 h-12 rounded-full bg-zim-600 text-white flex items-center justify-center font-semibold">{ranger.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div><div><h2 className="font-semibold text-zim-800">{ranger.name}</h2><p className="text-sm text-gray-500">{ranger.badge_number} · {ranger.rank?.replace('_', ' ') || 'Officer'}</p><p className="mt-2 text-xs flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${ranger.is_on_duty ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}/>{ranger.is_on_duty ? 'On duty' : 'Off duty'} <Wifi size={12} className="ml-2"/> {ranger.specialization?.replace('_', ' ') || 'General'}</p></div></div></article>)}{!visible.length && <p className="text-gray-500">No rangers found.</p>}</div></div>;
};
export default Rangers;
