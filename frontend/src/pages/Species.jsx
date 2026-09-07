import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { speciesApi } from '../api/endpoints';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

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

const conservationOptions = ['CR', 'EN', 'VU', 'NT', 'LC'];

const blank = {
  name: '',
  scientific_name: '',
  conservation_status: '',
  population_estimate: '',
  habitat: '',
  threats: '',
  image_url: '',
};

const Species = () => {
  const { isAdmin } = useAuth();
  const [species, setSpecies] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteId, setDeleteId] = useState(null);

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

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setCreateOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || '',
      scientific_name: s.scientific_name || '',
      conservation_status: s.conservation_status || '',
      population_estimate: s.population_estimate?.toString() || '',
      habitat: s.habitat || '',
      threats: s.threats || '',
      image_url: s.image_url || '',
    });
    setCreateOpen(true);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    try {
      const payload = {
        ...form,
        population_estimate: form.population_estimate ? Number(form.population_estimate) : null,
      };
      if (editing) {
        await speciesApi.update(editing.id, payload);
      } else {
        await speciesApi.create(payload);
      }
      setCreateOpen(false);
      setForm(blank);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || `Unable to ${editing ? 'update' : 'create'} species.`);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await speciesApi.delete(deleteId);
      setDeleteId(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to delete species.');
    }
  };

  if (loading) return <div className="text-center py-10">Loading species...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Species Management</h1>
          <p className="text-sm text-gray-500">Conservation records from the backend</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm">Refresh</button>
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> Add species
            </button>
          )}
        </div>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search species..."
          className="w-full pl-10 pr-4 py-2 border border-earth-200 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visible.map((s) => (
          <article key={s.id} className="card-zim">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-zim-800">{s.name}</h2>
                <p className="text-sm italic text-gray-500">{s.scientific_name || 'Scientific name not recorded'}</p>
                <span className={`inline-block mt-2 ${statusClass[s.conservation_status] || 'badge-medium'}`}>
                  {statusName[s.conservation_status] || s.conservation_status || 'Status not recorded'}
                </span>
              </div>
              {isAdmin && (
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-earth-100 text-gray-500 hover:text-zim-700" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p><strong>Population:</strong> {s.population_estimate?.toLocaleString() || 'Not recorded'}</p>
              <p><strong>Habitat:</strong> {s.habitat || 'Not recorded'}</p>
              <p><strong>Threats:</strong> {s.threats || 'Not recorded'}</p>
            </div>
          </article>
        ))}
        {!visible.length && <p className="text-gray-500">No species found.</p>}
      </div>

      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setEditing(null); }} title={editing ? 'Edit Species' : 'Add Species'}>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Species name"
            className="border rounded-xl px-3 py-2"
          />
          <input
            value={form.scientific_name}
            onChange={(e) => setForm({ ...form, scientific_name: e.target.value })}
            placeholder="Scientific name"
            className="border rounded-xl px-3 py-2"
          />
          <select
            value={form.conservation_status}
            onChange={(e) => setForm({ ...form, conservation_status: e.target.value })}
            className="border rounded-xl px-3 py-2"
          >
            <option value="">Select conservation status</option>
            {conservationOptions.map((s) => (
              <option key={s} value={s}>{statusName[s]}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            value={form.population_estimate}
            onChange={(e) => setForm({ ...form, population_estimate: e.target.value })}
            placeholder="Population estimate"
            className="border rounded-xl px-3 py-2"
          />
          <textarea
            value={form.habitat}
            onChange={(e) => setForm({ ...form, habitat: e.target.value })}
            placeholder="Habitat"
            className="border rounded-xl px-3 py-2"
          />
          <textarea
            value={form.threats}
            onChange={(e) => setForm({ ...form, threats: e.target.value })}
            placeholder="Threats"
            className="border rounded-xl px-3 py-2"
          />
          <input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="Image URL"
            className="border rounded-xl px-3 py-2"
          />
          <button className="btn-primary justify-center">{editing ? 'Update' : 'Save'}</button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Species" size="sm">
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{species.find((s) => s.id === deleteId)?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteId(null)} className="btn-outline text-sm">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Species;
