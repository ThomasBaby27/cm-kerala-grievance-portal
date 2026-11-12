import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, Loader2, User, Building, Landmark, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [activeRole, setActiveRole] = useState('citizen'); // Default active tab is Citizen
  const [email, setEmail] = useState('');                 // Starts completely empty
  const [password, setPassword] = useState('');           // Starts completely empty
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // Role metadata and demo credentials
  const roleConfig = {
    citizen: {
      title: 'Citizen Sign In',
      subtitle: 'Chief Minister\'s Public Grievance Portal',
      demoEmail: 'citizen@demo.com',
      demoPass: 'Demo@1234',
      badge: 'Public Citizen',
      targetPath: '/citizen'
    },
    cmo_admin: {
      title: 'CMO Administration Console',
      subtitle: 'Chief Minister\'s Office Oversight & Routing',
      demoEmail: 'cmo@kerala.gov.in',
      demoPass: 'Demo@1234',
      badge: 'CMO Official',
      targetPath: '/cmo'
    },
    department_officer: {
      title: 'Department Action Desk',
      subtitle: 'Field Inquiry & Action Taken Report (ATR)',
      demoEmail: 'officer.pwd@kerala.gov.in',
      demoPass: 'Demo@1234',
      badge: 'Department Officer',
      targetPath: '/officer'
    }
  };

  const handleRoleTabChange = (role) => {
    setActiveRole(role);
    // Switch tabs without autofilling inputs so users type their credentials
    setEmail('');
    setPassword('');
  };

  const fillDemoCredentials = () => {
    setEmail(roleConfig[activeRole].demoEmail);
    setPassword(roleConfig[activeRole].demoPass);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);

      // Strict Role-Based Access Control Verification
      if (activeRole !== user.role) {
        // Log out immediately so unauthorized token is wiped
        logout();

        let readableUserRole = 'Citizen';
        if (user.role === 'cmo_admin') readableUserRole = 'CMO Administrator';
        if (user.role === 'department_officer') readableUserRole = 'Department Officer';

        let readablePortalRole = 'Public Citizen';
        if (activeRole === 'cmo_admin') readablePortalRole = 'CMO Administrator';
        if (activeRole === 'department_officer') readablePortalRole = 'Department Officer';

        await Swal.fire({
          icon: 'warning',
          title: 'Access Denied: Role Mismatch',
          html: `
            <div class="text-left text-xs space-y-2 text-slate-600">
              <p>Your account is registered as a <b>${readableUserRole}</b>.</p>
              <p>You cannot sign in through the <b>${readablePortalRole}</b> portal.</p>
              <p class="text-slate-400">Please select the appropriate tab corresponding to your assigned role.</p>
            </div>
          `,
          confirmButtonText: `Switch to ${readableUserRole} Tab`,
          confirmButtonColor: '#065f46',
          customClass: {
            popup: 'rounded-2xl shadow-xl border border-slate-100',
            title: 'text-lg font-bold text-slate-900'
          }
        });

        // Switch to the user's correct tab automatically
        setActiveRole(user.role);
        return;
      }

      // Successful verification for corresponding role
      if (user.role === 'cmo_admin') {
        await Swal.fire({
          icon: 'success',
          title: 'Welcome CMO Administrator!',
          text: 'Authorized access verified. Entering CMO Oversight Console...',
          showConfirmButton: false,
          timer: 1400,
          customClass: { popup: 'rounded-2xl shadow-xl' }
        });
        navigate('/cmo');
      } else if (user.role === 'department_officer') {
        await Swal.fire({
          icon: 'success',
          title: 'Welcome Department Officer!',
          text: 'Authorized access verified. Entering Action Desk...',
          showConfirmButton: false,
          timer: 1400,
          customClass: { popup: 'rounded-2xl shadow-xl' }
        });
        navigate('/officer');
      } else {
        const result = await Swal.fire({
          icon: 'success',
          title: 'User Logged In Successfully!',
          html: `Welcome back, <b>${user.name || 'Citizen'}</b>!<br>Where would you like to go?`,
          showCancelButton: true,
          confirmButtonText: 'My Complaints Dashboard',
          cancelButtonText: 'Portal Home',
          confirmButtonColor: '#065f46',
          cancelButtonColor: '#0284c7',
          reverseButtons: true,
          customClass: {
            popup: 'rounded-2xl shadow-xl border border-slate-100',
            title: 'text-xl font-bold text-slate-900',
            htmlContainer: 'text-sm text-slate-600'
          }
        });

        if (result.isConfirmed) {
          navigate('/citizen');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Email or Password',
        text: 'The email or password you entered is incorrect. Please double check and try again.',
        showCancelButton: true,
        confirmButtonText: 'Try Again',
        cancelButtonText: 'Register as Citizen',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-slate-100',
          title: 'text-lg font-bold text-slate-900'
        }
      }).then((result) => {
        if (!result.isConfirmed && result.dismiss === Swal.DismissReason.cancel) {
          navigate('/register');
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-800 rounded-xl mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {roleConfig[activeRole].title}
          </h1>
          <p className="text-xs text-slate-500">
            {roleConfig[activeRole].subtitle}
          </p>
        </div>

        {/* Role Selector Tabs (Citizen is Default) */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 text-center">
            Sign In Portal Role
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleTabChange('citizen')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeRole === 'citizen'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('cmo_admin')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeRole === 'cmo_admin'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
              <span>CMO</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('department_officer')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeRole === 'department_officer'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Officer</span>
            </button>
          </div>
        </div>

        {/* Demo Credentials Chip */}
        {/* <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs">
          <span className="text-slate-500">Evaluation Demo Account</span>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-emerald-800 font-bold hover:underline"
          >
            Autofill {roleConfig[activeRole].badge}
          </button>
        </div> */}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder={`Enter your ${roleConfig[activeRole].badge.toLowerCase()} email`}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                placeholder="Enter password"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-70 mt-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Role & Access...</span>
              </>
            ) : (
              <>
                <span>Sign In as {roleConfig[activeRole].badge}</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {activeRole === 'citizen' && (
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-emerald-800 font-bold hover:underline">
                Register as Citizen
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}