import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(email, password);
      if (u.role === 'cmo_admin') navigate('/cmo');
      else if (u.role === 'department_officer') navigate('/officer');
      else navigate('/submit');
    } catch {
      alert('Invalid login credentials');
    }
  };
  return (
    <div className="max-w-sm mx-auto my-12 px-4">
      <div className="bg-white p-6 rounded-xl border space-y-4 text-xs">
        <h1 className="text-xl font-bold text-slate-900 text-center">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="font-medium block mb-1">Email</label><input type="email" required className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label className="font-medium block mb-1">Password</label><input type="password" required className="w-full border p-2 rounded" value={password} onChange={e => setPassword(e.target.value)} /></div>
          <button type="submit" className="w-full bg-emerald-800 text-white py-2 rounded font-semibold">Login</button>
        </form>
        <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-600 space-y-1 border">
          <div className="font-bold">Demo Accounts:</div>
          <div>Citizen: citizen@demo.com / Demo@1234</div>
          <div>CMO: cmo@kerala.gov.in / Demo@1234</div>
          <div>Officer: officer.pwd@kerala.gov.in / Demo@1234</div>
        </div>
      </div>
    </div>
  );
}
