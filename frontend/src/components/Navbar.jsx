import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, Send } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to log out of your session?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Log Out',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-2xl shadow-xl'
      }
    });

    if (result.isConfirmed) {
      logout();
      navigate('/');
    }
  };

  // Determine dashboard target based on user role
  const getDashboardPath = () => {
    if (user?.role === 'cmo_admin') return '/cmo';
    if (user?.role === 'department_officer') return '/officer';
    return '/citizen';
  };

  return (
    <header className="bg-emerald-900 text-white sticky top-0 z-40 shadow-md">
      {/* Top Government Banner */}
      <div className="bg-amber-500 text-slate-950 text-[11px] font-semibold text-center py-1 tracking-wide">
        Chief Minister's Public Grievance Redressal Portal ❖ Government of Kerala (Prototype)
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="p-2 bg-emerald-800 rounded-xl border border-emerald-700">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight leading-tight">
              CM KERALA
            </div>
            <div className="text-[10px] text-emerald-200">
              Grievance Redressal Portal
            </div>
          </div>
        </Link>

        {/* Public Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-emerald-100">
          <Link to="/" className="hover:text-amber-400 transition">Home</Link>
          <Link to="/#about" className="hover:text-amber-400 transition">About</Link>
          <Link to="/#how-it-works" className="hover:text-amber-400 transition">How It Works</Link>
          <Link to="/departments" className="hover:text-amber-400 transition">Departments</Link>
          <Link to="/track" className="hover:text-amber-400 transition">Track</Link>
          <Link to="/faq" className="hover:text-amber-400 transition">FAQ</Link>
          <Link to="/contact" className="hover:text-amber-400 transition">Contact</Link>
        </div>

        {/* Auth Navigation Actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              {/* My Dashboard Button (Access /citizen directly) */}
              <Link
                to={getDashboardPath()}
                className="bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-700 transition shadow-xs"
                title="Open My Complaints Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">My Dashboard</span>
              </Link>

              {/* Submit Grievance Quick Link */}
              <Link
                to="/submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Submit Grievance</span>
              </Link>

              {/* Logout Button with SweetAlert confirmation */}
              <button
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-xl transition shadow-xs"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link
                to="/login"
                className="px-3 py-2 text-emerald-100 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-xs transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}