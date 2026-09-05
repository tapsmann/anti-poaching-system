import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, protectedAreasApi } from '../api/endpoints';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', badge_number: '', email: '', password: '', assigned_area_id: '' });
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    protectedAreasApi.getAll().then(({ data }) => setAreas(data || [])).catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.assigned_area_id) payload.assigned_area_id = Number(payload.assigned_area_id);
      else delete payload.assigned_area_id;
      await authApi.register(payload);
      navigate('/login', { state: { registered: true } });
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to create account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-earth-200">
        <h1 className="text-2xl font-bold text-zim-800">Register ranger</h1>
        <p className="mt-1 text-sm text-gray-500">Create an operations account.</p>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        {[
          ['name', 'Full name', 'text'],
          ['badge_number', 'Badge number', 'text'],
          ['email', 'Email', 'email'],
          ['password', 'Password (8+ characters)', 'password']
        ].map(([key, label, type]) => (
          <label key={key} className="block mt-4 text-sm font-medium text-zim-800">
            {label}
            <input
              required
              minLength={key === 'password' ? 8 : undefined}
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 w-full rounded-xl border border-earth-300 px-3 py-2.5"
            />
          </label>
        ))}

        <label className="block mt-4 text-sm font-medium text-zim-800">
          Assigned Park
          <select
            value={form.assigned_area_id}
            onChange={(e) => setForm({ ...form, assigned_area_id: e.target.value })}
            className="mt-1 w-full rounded-xl border border-earth-300 px-3 py-2.5"
          >
            <option value="">No park assigned</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>

        <button disabled={saving} className="btn-primary w-full justify-center mt-6">
          {saving ? 'Creating...' : 'Create account'}
        </button>

        <p className="mt-4 text-sm">
          Already registered? <Link className="text-zim-700 underline" to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
