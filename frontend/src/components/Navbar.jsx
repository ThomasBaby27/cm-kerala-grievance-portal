import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, LayoutDashboard, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
      <div className="bg-amber-500 text-black text-xs font-semibold py-1 px-4 text-center">
        Chief Minister's Public Grievance Redressal Portal — Government of Kerala (Prototype)
      </div>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-amber-400" />
          <div>
            <div className="font-bold text-lg leading-tight">CM KERALA</div>
            <div className="text-xs text-emerald-200">Grievance Redressal Portal</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-amber-300">Home</Link>
          <Link to="/about" className="hover:text-amber-300">About</Link>
          <Link to="/how-it-works" className="hover:text-amber-300">How It Works</Link>
          <Link to="/departments" className="hover:text-amber-300">Departments</Link>
          <Link to="/track" className="hover:text-amber-300 flex items-center gap-1"><Search className="w-4 h-4" /> Track</Link>
          <Link to="/faq" className="hover:text-amber-300">FAQ</Link>
          <Link to="/contact" className="hover:text-amber-300">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'cmo_admin' && <Link to="/cmo" className="text-sm text-amber-300 font-semibold">CMO Console</Link>}
              {user.role === 'department_officer' && <Link to="/officer" className="text-sm text-amber-300 font-semibold">Officer Desk</Link>}
              {user.role === 'citizen' && <Link to="/submit" className="text-sm text-amber-300 font-semibold">Submit Grievance</Link>}
              <button onClick={() => { logout(); navigate('/'); }} className="bg-red-600/80 hover:bg-red-600 p-2 rounded">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm px-3 py-1.5 rounded hover:bg-emerald-800">Login</Link>
              <Link to="/register" className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-3 py-1.5 rounded">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
