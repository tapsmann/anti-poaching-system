import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { speciesApi } from '../api/endpoints';

const statusName = { 
  CR: 'Critically Endangered', 
  EN: 'Endangered', 
  VU: 'Vulnerable', 
  NT: 'Near Threatened', 
  LC: 'Least Concern' 
};

const statusClass = { 
  CR: 'badge-critical', 
  EN: 'badge-high', 
  VU: 'badge-medium', 
  NT: 'badge-medium', 
  LC: 'badge-low' 
};

const Species = () => {
  const [species, setSpecies] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const { data } = await speciesApi.getAll();
      setSpecies(data || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load species.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => 
    species.filter((s) => 
      `${s.name} ${s.scientific_name || ''} ${s.threats || ''}`.toLowerCase().includes(query.toLowerCase())
    ), [species, query]
  );

  if (loading) return <div className="text-center py-10">Loading species…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Species Management</h1>
          <p className="text-sm text-gray-500">Conservation records from the backend</p>
        </div>
        <button onClick={load} className="btn-primary">Refresh</button>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search species…"
          className="w-full pl-10 pr-4 py-2 border border-earth-200 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visible.map((s) => (
          <article key={s.id} className="card-zim">
            <h2 className="text-lg font-semibold text-zim-800">{s.name}</h2>
            <p className="text-sm italic text-gray-500">{s.scientific_name || 'Scientific name not recorded'}</p>
            <span className={`inline-block mt-2 ${statusClass[s.conservation_status] || 'badge-medium'}`}>
              {statusName[s.conservation_status] || s.conservation_status || 'Status not recorded'}
            </span>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p><strong>Population:</strong> {s.population_estimate?.toLocaleString() || 'Not recorded'}</p>
              <p><strong>Habitat:</strong> {s.habitat || 'Not recorded'}</p>
              <p><strong>Threats:</strong> {s.threats || 'Not recorded'}</p>
            </div>
          </article>
        ))}
        {!visible.length && <p className="text-gray-500">No species found.</p>}
      </div>
    </div>
  );
};

export default Species;
