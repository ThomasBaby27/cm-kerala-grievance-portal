import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';
import { ShieldCheck, User, Mail, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'citizen' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/auth/register', form);

      // Success SweetAlert
      const result = await Swal.fire({
        icon: 'success',
        title: 'Account Created Successfully!',
        html: `Welcome aboard, <b>${form.name}</b>!<br>Please login with your credentials to submit and monitor grievances.`,
        showCancelButton: true,
        confirmButtonText: 'Go to Login',
        // cancelButtonText: 'Go to Home',
        confirmButtonColor: '#065f46', // emerald-800
        cancelButtonColor: '#0284c7',  // sky-600
        reverseButtons: true,          // places "Go to Home" on left, "Go to Login" on right
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-slate-100',
          title: 'text-xl font-bold text-slate-900',
          htmlContainer: 'text-sm text-slate-600'
        }
      });

      if (result.isConfirmed) {
        navigate('/login');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail;

      // Duplicate email check
      if (err.response?.status === 400 || (typeof errorDetail === 'string' && errorDetail.toLowerCase().includes('already registered'))) {
        Swal.fire({
          icon: 'warning',
          title: 'Email Already Registered',
          html: `An account with <b>${form.email}</b> already exists in the portal.<br><br>Please try logging in with this email, or register using a different email address.`,
          showCancelButton: true,
          confirmButtonText: 'Go to Login',
          cancelButtonText: 'Try Another Email',
          confirmButtonColor: '#065f46',
          cancelButtonColor: '#94a3b8',
          customClass: {
            popup: 'rounded-2xl shadow-xl border border-slate-100',
            title: 'text-xl font-bold text-slate-900',
            htmlContainer: 'text-sm text-slate-600'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
      } else {
        // Fallback generic error
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: errorDetail || 'Unable to complete your registration. Please check your network connection and try again.',
          confirmButtonColor: '#dc2626',
          customClass: {
            popup: 'rounded-2xl shadow-xl'
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-800 rounded-xl mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Citizen Registration</h1>
          <p className="text-xs text-slate-500">
            Create an account to submit grievances directly to the Chief Minister's Office.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="Enter your full name"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="citizen@example.com"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="Create a secure password"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-70 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-800 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}