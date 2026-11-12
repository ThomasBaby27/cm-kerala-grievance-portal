import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';
import { Search, Clock, Building2, MapPin, Tag, AlertCircle, Calendar, User, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function TrackGrievance() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [refId, setRefId] = useState(searchParams.get('ref') || '');
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const fetchStatus = async (idToSearch) => {
    if (!idToSearch || !idToSearch.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Reference ID Missing',
        text: 'Please enter a valid Reference ID to search (e.g. KL-2026-XXXXXX).',
        confirmButtonColor: '#065f46',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-slate-100',
        }
      });
      return;
    }

    setLoading(true);
    setGrievance(null);

    try {
      const res = await api.get(`/api/grievances/track/${idToSearch.trim()}`);
      setGrievance(res.data);
    } catch (err) {
      // SweetAlert2 for wrong / incorrect reference ID
      await Swal.fire({
        icon: 'error',
        title: 'Reference ID Incorrect',
        html: `The entered Reference ID <b>"${idToSearch.trim()}"</b> is incorrect or does not exist in our system.<br><br>Please double-check the ID and try again.`,
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#dc2626',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-slate-100',
          title: 'text-xl font-bold text-slate-900',
          htmlContainer: 'text-sm text-slate-600'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refId) {
      fetchStatus(refId);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Track Grievance Status</h1>
        <p className="text-slate-500 text-sm">
          Enter your unique tracking reference number (e.g., <span className="font-mono font-semibold">KL-2026-XXXXXX</span>) to review real-time actions and departmental history.
        </p>
      </div>

      {/* Input Search Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStatus(refId);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="Enter Reference ID (e.g. KL-2026-4C76DE)"
              className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono text-sm tracking-wide transition uppercase"
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-70"
          >
            {loading ? 'Searching...' : 'Track Grievance'}
          </button>
        </form>
      </div>

      {/* Results View */}
      {grievance && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider px-3 py-1 bg-slate-100 text-slate-700 rounded-md uppercase">
                {grievance.reference_id}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">{grievance.subject}</h2>
              {grievance.created_at && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Submitted on: {formatDateTime(grievance.created_at)}</span>
                </div>
              )}
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold border ${getStatusColor(grievance.status)}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {grievance.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Key Details Grid: Department, District, Category, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                <Building2 className="w-4 h-4 text-emerald-700" /> Assigned Department
              </div>
              <div className="font-bold text-slate-800 text-sm">{grievance.department_name}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                <MapPin className="w-4 h-4 text-emerald-700" /> District
              </div>
              <div className="font-bold text-slate-800 text-sm">{grievance.district}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                <Tag className="w-4 h-4 text-emerald-700" /> Category
              </div>
              <div className="font-bold text-slate-800 text-sm">{grievance.category}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                <AlertCircle className="w-4 h-4 text-emerald-700" /> Priority
              </div>
              <div className="font-bold text-slate-800 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  grievance.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  {grievance.priority}
                </span>
              </div>
            </div>

            {/* Complainant Profile Card */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-800 text-white rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Complainant / Citizen</span>
                <div className="text-sm font-bold text-slate-900">{grievance.complainant_name}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:border-l sm:border-emerald-200 sm:pl-6">
              <Mail className="w-4 h-4 text-emerald-700" />
              <span>{grievance.complainant_email}</span>
            </div>
          </div>
          </div>

          {/* Grievance Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Complaint Description</h4>
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
              {grievance.description}
            </div>
          </div>

          {/* AI Summary (if available) */}
          {grievance.ai_summary && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">CMO AI Executive Summary</h4>
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                {grievance.ai_summary}
              </div>
            </div>
          )}

          {/* Chronological Audit Timeline */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" /> Grievance Lifecycle History
            </h3>

            <div className="space-y-6 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
              {grievance.history && grievance.history.length > 0 ? (
                grievance.history.map((h, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-700 border-2 border-white ring-2 ring-emerald-300"></div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs uppercase text-emerald-800">
                          Status Transition: <span className="underline">{h.new_status}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatDateTime(h.timestamp)}
                        </span>
                      </div>
                      {h.remarks && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                          <b>Officer / Desk Remarks:</b> {h.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No history records logged yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}