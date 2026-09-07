import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Search, Plus, Pencil, Trash2, Upload, X, ImageIcon } from 'lucide-react';
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

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  if (import.meta.env.PROD) {
    return 'https://anti-poaching-backend.onrender.com';
  }
  return 'http://localhost:8000';
};

const ImageUpload = ({ value, onChange, disabled }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (value) {
      if (value.startsWith('http') || value.startsWith('/uploads')) {
        setPreview(value.startsWith('/') ? `${getApiBase()}${value}` : value);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      alert('Only JPG, PNG, GIF, and WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    onChange({ file, localPreview });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    onChange({ file: null, localPreview: null, url: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Species Image</label>
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border border-earth-200"
          />
          {!disabled && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-500 hover:text-red-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-zim-500 bg-zim-50' : 'border-earth-200 hover:border-zim-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-600">Click or drag to upload an image</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP up to 5MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
        disabled={disabled}
      />

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <ImageIcon className="text-gray-400" size={16} />
        </div>
        <input
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => {
            onChange({ file: null, localPreview: null, url: e.target.value });
          }}
          placeholder="Or paste image URL"
          className="w-full pl-10 pr-4 py-2 border border-earth-200 rounded-xl text-sm"
          disabled={disabled}
        />
      </div>
    </div>
  );
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
  const [imageData, setImageData] = useState({ file: null, localPreview: null, url: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    setImageData({ file: null, localPreview: null, url: '' });
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
    setImageData({ file: null, localPreview: null, url: s.image_url || '' });
    setCreateOpen(true);
  };

  const handleImageChange = (data) => {
    if (data.url !== undefined) {
      setImageData({ file: null, localPreview: null, url: data.url });
      setForm({ ...form, image_url: data.url });
    } else {
      setImageData(data);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setUploading(true);
    try {
      const payload = {
        ...form,
        image_url: imageData.url || form.image_url || null,
        population_estimate: form.population_estimate ? Number(form.population_estimate) : null,
      };
      
      let speciesId;
      if (editing) {
        const { data } = await speciesApi.update(editing.id, payload);
        speciesId = editing.id;
      } else {
        const { data } = await speciesApi.create(payload);
        speciesId = data.id;
      }

      // Upload file if one was selected
      if (imageData.file && speciesId) {
        await speciesApi.uploadImage(speciesId, imageData.file);
      }

      setCreateOpen(false);
      setForm(blank);
      setImageData({ file: null, localPreview: null, url: '' });
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || `Unable to ${editing ? 'update' : 'create'} species.`);
    } finally {
      setUploading(false);
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

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${getApiBase()}${imageUrl}`;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((s) => (
          <article key={s.id} className="card-zim overflow-hidden">
            {s.image_url && (
              <div className="h-48 overflow-hidden bg-earth-100">
                <img
                  src={getImageSrc(s.image_url)}
                  alt={s.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
            {!s.image_url && (
              <div className="h-32 flex items-center justify-center bg-earth-50">
                <ImageIcon className="text-earth-300" size={48} />
              </div>
            )}
            <div className="p-4">
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
            </div>
          </article>
        ))}
        {!visible.length && <p className="text-gray-500">No species found.</p>}
      </div>

      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setEditing(null); }} title={editing ? 'Edit Species' : 'Add Species'} wide>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Species name *"
                className="w-full border rounded-xl px-3 py-2"
              />
              <input
                value={form.scientific_name}
                onChange={(e) => setForm({ ...form, scientific_name: e.target.value })}
                placeholder="Scientific name"
                className="w-full border rounded-xl px-3 py-2"
              />
              <select
                value={form.conservation_status}
                onChange={(e) => setForm({ ...form, conservation_status: e.target.value })}
                className="w-full border rounded-xl px-3 py-2"
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
                className="w-full border rounded-xl px-3 py-2"
              />
              <textarea
                value={form.habitat}
                onChange={(e) => setForm({ ...form, habitat: e.target.value })}
                placeholder="Habitat"
                className="w-full border rounded-xl px-3 py-2"
                rows={2}
              />
              <textarea
                value={form.threats}
                onChange={(e) => setForm({ ...form, threats: e.target.value })}
                placeholder="Threats"
                className="w-full border rounded-xl px-3 py-2"
                rows={2}
              />
            </div>
            <div>
              <ImageUpload
                value={imageData.url || imageData.localPreview}
                onChange={handleImageChange}
                disabled={uploading}
              />
            </div>
          </div>
          <button disabled={uploading} className="btn-primary justify-center">
            {uploading ? 'Saving...' : editing ? 'Update' : 'Save'}
          </button>
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
