import React, { useEffect, useMemo, useState } from 'react';
import { Wrench, Plus, Search, Radio, Car, Camera, Shield } from 'lucide-react';
import { equipmentApi, rangersApi } from '../api/endpoints';
import Modal from '../components/common/Modal';

const typeIcons = { vehicle: Car, drone: Shield, camera: Camera, radio: Radio };
const statusColors = { active: 'badge-low', maintenance: 'badge-medium', damaged: 'badge-high', lost: 'badge-critical', retired: 'badge-medium' };

const blank = { name: '', type: 'radio', serial_number: '', status: 'active', notes: '', assigned_to: '' };

export default function Equipment() {
  const [items, setItems] = useState([]);
  const [rangers, setRangers] = useState([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const load = async () => {
    try {
      setError('');
      const [eRes, rRes] = await Promise.all([equipmentApi.getAll(), rangersApi.getAll()]);
      setItems(eRes.data || []);
      setRangers(rRes.data || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load equipment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() =>
    items.filter((e) =>
      (!typeFilter || e.type === typeFilter) &&
      `${e.name} ${e.serial_number || ''} ${e.assigned_to_name || ''}`.toLowerCase().includes(query.toLowerCase())
    ), [items, query, typeFilter]
  );

  const create = async (ev) => {
    ev.preventDefault();
    try {
      await equipmentApi.create({
        ...form,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      });
      setCreateOpen(false);
      setForm(blank);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to create equipment.');
    }
  };

  if (loading) return <div className="text-center py-10">Loading equipment...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zim-800">Equipment Tracking</h1>
          <p className="text-sm text-gray-500">Vehicles, radios, drones, cameras, and gear</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm">Refresh</button>
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add equipment
          </button>
        </div>
      </div>

      {error && <p className="card-zim text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search equipment..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 border rounded-xl">
          <option value="">All types</option>
          {['vehicle', 'drone', 'camera', 'radio', 'tracking_device', 'firearm', 'survival_gear', 'medical_kit', 'k9_unit'].map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((item) => {
          const Icon = typeIcons[item.type] || Wrench;
          return (
            <article key={item.id} className="card-zim">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zim-50">
                  <Icon size={20} className="text-zim-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-zim-800">{item.name}</h2>
                  <p className="text-xs text-gray-500">{item.type?.replace('_', ' ')} · {item.serial_number || 'No serial'}</p>
                  <div className="mt-2 flex gap-2">
                    <span className={statusColors[item.status] || 'badge-medium'}>{item.status}</span>
                  </div>
                  {item.assigned_to_name && (
                    <p className="mt-2 text-sm text-gray-600">Assigned to: {item.assigned_to_name}</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!visible.length && <p className="text-gray-500">No equipment found.</p>}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Equipment">
        <form onSubmit={create} className="grid gap-3">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Equipment name" className="border rounded-xl px-3 py-2" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border rounded-xl px-3 py-2">
            {['vehicle', 'drone', 'camera', 'radio', 'tracking_device', 'firearm', 'survival_gear', 'medical_kit', 'k9_unit'].map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
          <input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} placeholder="Serial number" className="border rounded-xl px-3 py-2" />
          <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} className="border rounded-xl px-3 py-2">
            <option value="">Unassigned</option>
            {rangers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border rounded-xl px-3 py-2">
            {['active', 'maintenance', 'damaged', 'lost', 'retired'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="border rounded-xl px-3 py-2" />
          <button className="btn-primary justify-center">Save</button>
        </form>
      </Modal>
    </div>
  );
}
