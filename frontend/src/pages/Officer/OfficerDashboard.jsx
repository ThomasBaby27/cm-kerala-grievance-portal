import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  FileCheck, 
  Clock, 
  Send, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  User, 
  MapPin, 
  Sparkles, 
  Upload, 
  FileText 
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active ATR Modal State
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [atrReport, setAtrReport] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [interimRemarks, setInterimRemarks] = useState('');
  const [submittingAtr, setSubmittingAtr] = useState(false);

  const loadOfficerData = async () => {
    setLoading(true);
    try {
      // Fetch assigned complaints
      const res = await api.get('/api/officer/grievances');
      setGrievances(res.data);
      setFiltered(res.data);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch department grievance records.',
        confirmButtonColor: '#065f46'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficerData();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let list = [...grievances];

    if (statusFilter !== 'All') {
      list = list.filter(g => g.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(g => 
        g.reference_id?.toLowerCase().includes(q) ||
        g.subject?.toLowerCase().includes(q) ||
        g.district?.toLowerCase().includes(q) ||
        g.complainant_name?.toLowerCase().includes(q)
      );
    }

    setFiltered(list);
  }, [statusFilter, searchQuery, grievances]);

  // Intermediate Status Update (e.g. Under Investigation)
  const handleQuickStatusChange = async (g, newStatus) => {
    const { value: remarks } = await Swal.fire({
      title: `Update Status to "${newStatus}"`,
      input: 'text',
      inputLabel: 'Field Remarks / Action Summary',
      inputPlaceholder: 'e.g. Assigned field engineer for on-site inspection...',
      inputValidator: (val) => (!val ? 'Remarks are mandatory.' : null),
      showCancelButton: true,
      confirmButtonText: 'Update Status',
      confirmButtonColor: '#065f46',
      cancelButtonColor: '#64748b'
    });

    if (remarks) {
      try {
        await api.post(`/api/officer/grievances/${g.id}/status`, {
          status: newStatus,
          remarks: remarks
        });

        await Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Grievance transitioned to ${newStatus}.`,
          timer: 1200,
          showConfirmButton: false
        });

        loadOfficerData();
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not update status.', confirmButtonColor: '#dc2626' });
      }
    }
  };

  // Submit Final Action-Taken Report (ATR)
  const handleAtrSubmit = async (e) => {
    e.preventDefault();
    if (!atrReport.trim() || atrReport.trim().length < 15) {
      Swal.fire({
        icon: 'warning',
        title: 'Detailed Report Required',
        text: 'Please write a descriptive Action-Taken Report (minimum 15 characters).',
        confirmButtonColor: '#065f46'
      });
      return;
    }

    setSubmittingAtr(true);
    try {
      await api.post(`/api/officer/grievances/${selectedGrievance.id}/atr`, {
        action_taken_report: atrReport,
        evidence_url: evidenceUrl || null,
        final_status: 'Resolved'
      });

      await Swal.fire({
        icon: 'success',
        title: 'ATR Submitted!',
        html: `Action-Taken Report logged successfully for <b>${selectedGrievance.reference_id}</b>.<br>Case marked <b>Resolved</b> and returned to Chief Minister's Office.`,
        confirmButtonColor: '#065f46'
      });

      setSelectedGrievance(null);
      setAtrReport('');
      setEvidenceUrl('');
      loadOfficerData();
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Unable to submit Action-Taken Report.',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setSubmittingAtr(false);
    }
  };

  // Metrics
  const totalAssigned = grievances.length;
  const inProgressCount = grievances.filter(g => g.status === 'In Progress' || g.status === 'Under Investigation').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-md font-bold text-xs uppercase tracking-wider">
              Department Action Desk
            </span>
            <span className="text-xs text-slate-400">Government of Kerala</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Officer Desk: {user?.name || 'Authorized Officer'}
          </h1>
          <p className="text-xs text-slate-500">
            Review grievances delegated by the Chief Minister's Office, conduct field inspections, and submit Action-Taken Reports (ATR).
          </p>
        </div>
        <button
          onClick={loadOfficerData}
          className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Total Delegated</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalAssigned}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-amber-600">Pending Field Action</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-0.5">{inProgressCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-emerald-600">ATR Completed (Resolved)</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Work Queue Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {['All', 'In Progress', 'Escalated', 'Resolved'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter.toLowerCase() === st.toLowerCase()
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'All' ? 'All Complaints' : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, citizen, subject..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Reference ID</th>
                <th className="px-6 py-3.5">Complainant</th>
                <th className="px-6 py-3.5">Subject & Location</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Latest Directive</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">Loading department queue...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    No active grievances delegated to your action queue.
                  </td>
                </tr>
              ) : (
                filtered.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {g.reference_id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{g.complainant_name}</div>
                      <div className="text-[11px] text-slate-400">{g.complainant_email}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate" title={g.subject}>
                        {g.subject}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        📍 {g.district} • {g.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        g.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {g.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                        g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        g.status === 'Escalated' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600 text-[11px]">
                      {g.latest_remarks}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {g.status !== 'Resolved' && (
                        <button
                          onClick={() => handleQuickStatusChange(g, 'Under Investigation')}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition"
                        >
                          Investigate
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedGrievance(g)}
                        className="bg-emerald-800 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 transition text-xs shadow-xs"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>{g.status === 'Resolved' ? 'View ATR' : 'Submit ATR'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action-Taken Report (ATR) Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                  {selectedGrievance.reference_id}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 mt-1">
                  Action-Taken Report (ATR): {selectedGrievance.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedGrievance(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Complaint Context */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="text-slate-500 font-bold uppercase tracking-wider">Citizen Problem Statement</div>
              <p className="text-slate-700 leading-relaxed">{selectedGrievance.description}</p>
              
              {selectedGrievance.ai_summary && (
                <div className="pt-2 border-t border-slate-200/60 text-emerald-900 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span><b>AI Summary:</b> {selectedGrievance.ai_summary}</span>
                </div>
              )}
            </div>

            {/* ATR Form */}
            <form onSubmit={handleAtrSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Comprehensive Action-Taken Report (Mandatory)
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Detail the physical inspection findings, repairs made, personnel deployed, and corrective action executed on ground..."
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs"
                  value={atrReport}
                  onChange={e => setAtrReport(e.target.value)}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Resolution Evidence Link / Work Completion Document (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or site photo evidence link"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs"
                  value={evidenceUrl}
                  onChange={e => setEvidenceUrl(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedGrievance(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAtr}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-70"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit ATR & Send to CMO</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}