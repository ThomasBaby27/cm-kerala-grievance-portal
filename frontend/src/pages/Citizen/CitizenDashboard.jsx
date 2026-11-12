import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Search, 
  Eye, 
  Star, 
  RotateCcw, 
  RefreshCw,
  Building2,
  Calendar,
  MessageSquare
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Feedback Modal State
  const [feedbackGrievance, setFeedbackGrievance] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [reopenRequest, setReopenRequest] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Fetch Grievances
  // Helper to get active user ID even during initial page reload
  const getActiveUserId = () => {
    if (user?.id) return user.id;
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.id || null;
      }
    } catch {
      return null;
    }
    return null;
  };

  // Fetch Grievances strictly for this citizen
  const loadGrievances = async () => {
    const currentUserId = getActiveUserId();
    
    // Do not fetch unfiltered data if citizen ID isn't resolved yet
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/api/citizen/grievances?citizen_id=${currentUserId}`);
      setGrievances(res.data);
      setFilteredGrievances(res.data);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to load your grievances. Please try again later.',
        confirmButtonColor: '#065f46'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, [user]); 

  // Filter and Search Logic
  useEffect(() => {
    let result = [...grievances];

    if (statusFilter !== 'ALL') {
      result = result.filter(g => g.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.reference_id?.toLowerCase().includes(q) ||
        g.subject?.toLowerCase().includes(q) ||
        g.district?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q)
      );
    }

    setFilteredGrievances(result);
  }, [statusFilter, searchQuery, grievances]);

  // Date Formatter (IST)
  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Status Badge Colors
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Reopened':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  // Submit Feedback / Reopen Action
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Feedback Required',
        text: 'Please enter remarks or comments regarding your experience.',
        confirmButtonColor: '#065f46'
      });
      return;
    }

    setSubmittingFeedback(true);
    try {
      await api.post(`/api/grievances/${feedbackGrievance.id}/feedback`, {
        rating: rating,
        comments: comments,
        reopen: reopenRequest
      });

      await Swal.fire({
        icon: 'success',
        title: reopenRequest ? 'Grievance Reopened' : 'Feedback Submitted!',
        text: reopenRequest 
          ? 'Your complaint has been reopened and prioritized back for CMO review.' 
          : 'Thank you for your valuable feedback to the Chief Minister\'s Office.',
        confirmButtonColor: '#065f46'
      });

      setFeedbackGrievance(null);
      setComments('');
      setReopenRequest(false);
      setRating(5);
      loadGrievances();
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Unable to submit feedback. Please try again.',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Metrics
  const totalCount = grievances.length;
  const pendingCount = grievances.filter(g => g.status === 'Submitted').length;
  const inProgressCount = grievances.filter(g => g.status === 'In Progress').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Citizen Portal</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor all your filed complaints, track departmental investigation progress, and submit feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadGrievances}
            className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Complaints"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/submit"
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File New Grievance</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Total Filed</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-blue-600">Under Review</div>
            <div className="text-2xl font-extrabold text-blue-700 mt-0.5">{pendingCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-amber-600">In Progress</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-0.5">{inProgressCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-emerald-600">Resolved Cases</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {['ALL', 'Submitted', 'In Progress', 'Resolved', 'Reopened'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  statusFilter.toLowerCase() === st.toLowerCase()
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Complaints' : st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, subject, district..."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading your grievances...
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Grievances Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No complaints match your active filter/search criteria.'
                : 'You have not submitted any complaints yet. Use the button below to register a new civic issue.'}
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" /> File a Grievance
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Date Filed</th>
                  <th className="px-6 py-3.5">Subject & Category</th>
                  <th className="px-6 py-3.5">District</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Current Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrievances.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {g.reference_id}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDateTime(g.created_at)}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate" title={g.subject}>
                        {g.subject}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {g.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {g.district}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        g.priority === 'High' 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {g.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${getBadgeStyle(g.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/track?ref=${g.reference_id}`)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1 transition"
                        title="Track Real-time Status"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Track</span>
                      </button>

                      {g.status === 'Resolved' && (
                        <button
                          onClick={() => setFeedbackGrievance(g)}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1 transition"
                          title="Leave Feedback or Reopen"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-300" />
                          <span>Feedback</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Citizen Feedback & Reopen Modal */}
      {feedbackGrievance && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Resolution Feedback: {feedbackGrievance.reference_id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">
                  {feedbackGrievance.subject}
                </p>
              </div>
              <button
                onClick={() => setFeedbackGrievance(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
              {/* Star Rating */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  How satisfied are you with the resolution?
                </label>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 font-semibold ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Remarks / Comments */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Citizen Remarks / Comments
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Share details regarding the department's action taken..."
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              {/* Reopen Checkbox Option */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="reopenBox"
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  checked={reopenRequest}
                  onChange={(e) => setReopenRequest(e.target.checked)}
                />
                <label htmlFor="reopenBox" className="text-slate-700 text-xs cursor-pointer">
                  <span className="font-bold text-rose-800 block">Not satisfied with the outcome?</span>
                  Check this box to <b>reopen this grievance</b> and return it to the Chief Minister's Office for secondary review.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFeedbackGrievance(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className={`px-5 py-2 rounded-xl text-white font-bold transition flex items-center gap-1.5 ${
                    reopenRequest
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-800 hover:bg-emerald-700'
                  }`}
                >
                  {reopenRequest ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen Case</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}