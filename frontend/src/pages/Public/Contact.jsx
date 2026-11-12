import React, { useState } from 'react';
import api from '../../api';
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/contact', form);
      setStatus('Your enquiry has been submitted successfully.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('Failed to submit message.');
    }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-6 rounded-xl border space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Contact Grievance Desk</h1>
        {status && <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded border">{status}</div>}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div><label className="font-medium block mb-1">Name</label><input type="text" required className="w-full border p-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="font-medium block mb-1">Email</label><input type="email" required className="w-full border p-2 rounded" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><label className="font-medium block mb-1">Subject</label><input type="text" required className="w-full border p-2 rounded" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></div>
          <div><label className="font-medium block mb-1">Message</label><textarea rows="3" required className="w-full border p-2 rounded" value={form.message} onChange={e => setForm({...form, message: e.target.value})} /></div>
          <button type="submit" className="w-full bg-emerald-800 text-white py-2 rounded font-semibold">Submit Message</button>
        </form>
      </div>
    </div>
  );
}
