import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'citizen' });
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/register', form);
      alert('Registered! Please login.');
      navigate('/login');
    } catch {
      alert('Registration failed.');
    }
  };
  return (
    <div className="max-w-sm mx-auto my-12 px-4">
      <div className="bg-white p-6 rounded-xl border space-y-4 text-xs">
        <h1 className="text-xl font-bold text-slate-900 text-center">Citizen Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="font-medium block mb-1">Name</label><input type="text" required className="w-full border p-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="font-medium block mb-1">Email</label><input type="email" required className="w-full border p-2 rounded" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><label className="font-medium block mb-1">Phone</label><input type="text" required className="w-full border p-2 rounded" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          <div><label className="font-medium block mb-1">Password</label><input type="password" required className="w-full border p-2 rounded" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
          <button type="submit" className="w-full bg-emerald-800 text-white py-2 rounded font-semibold">Register</button>
        </form>
      </div>
    </div>
  );
}
