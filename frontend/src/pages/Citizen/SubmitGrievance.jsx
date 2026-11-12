import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';
import { Sparkles, Send, Loader2, MapPin, FileText, Tag, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const DISTRICTS = [
  'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam',
  'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
];

export default function SubmitGrievance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    district: '',
    subject: '',
    description: '',
    category: '',
    priority: 'Medium',
    department_id: '',
    ai_summary: '',
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const handleAiAnalyze = async () => {
    if (!formData.description || formData.description.trim().length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Description Required',
        text: 'Please enter details in the description box before clicking Auto-Analyze with AI so the AI can evaluate the issue.',
        confirmButtonColor: '#065f46',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-slate-100',
          title: 'text-lg font-bold text-slate-900',
          htmlContainer: 'text-sm text-slate-600'
        }
      });
      return;
    }

    setAiLoading(true);
    setAiMessage('');

    try {
      const res = await api.post('/api/ai/analyze-grievance', {
        description: formData.description,
        district: formData.district || 'General',
      });
      const data = res.data;
      setFormData(prev => ({
        ...prev,
        category: data.category || prev.category,
        priority: data.priority || prev.priority,
        department_id: data.suggested_department_id || prev.department_id,
        ai_summary: data.summary || '',
      }));
      setAiMessage(`AI Analysis Applied: Suggested Category (${data.category}) & Priority (${data.priority}).`);
    } catch {
      Swal.fire({
        icon: 'info',
        title: 'AI Service Notice',
        text: 'AI categorization service is currently offline. You can manually enter Category and Priority.',
        confirmButtonColor: '#065f46',
        customClass: {
          popup: 'rounded-2xl shadow-xl'
        }
      });
    } finally {
      setAiLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      district: '',
      subject: '',
      description: '',
      category: '',
      priority: 'Medium',
      department_id: '',
      ai_summary: '',
    });
    setAiMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.district) {
      Swal.fire({
        icon: 'warning',
        title: 'Select District',
        text: 'Please pick your District from the dropdown list before submitting.',
        confirmButtonColor: '#065f46',
        customClass: {
          popup: 'rounded-2xl shadow-xl'
        }
      });
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await api.post('/api/grievances', {...formData, citizen_id: user?.id || null});

      const refId = res.data?.reference_id || res.data?.ref_id || 'KL-2026-UNKNOWN';

      const result = await Swal.fire({
        icon: 'success',
        title: 'Submitted!',
        html: `
          <div class="space-y-3">
            <p class="text-sm text-slate-600">Your grievance has been officially registered with the Chief Minister's Office.</p>
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 my-2">
              <span class="text-xs uppercase font-bold text-emerald-800 tracking-wider">Reference ID</span>
              <div style="font-family: monospace; font-size: 1.4rem; color: #065f46; font-weight: 800; letter-spacing: 1px;">
                ${refId}
              </div>
            </div>
            <p class="text-xs text-slate-500 font-medium">Please note down this Reference ID for all future tracking and status inquiries.</p>
          </div>
        `,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '🔍 Track This Grievance',
        denyButtonText: '➕ Submit Another',
        cancelButtonText: '🏠 Home Page',
        confirmButtonColor: '#065f46', // emerald-800
        denyButtonColor: '#0284c7',    // sky-600
        cancelButtonColor: '#64748b',  // slate-500
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-slate-100 p-6',
          title: 'text-2xl font-extrabold text-slate-900',
          actions: 'flex flex-wrap gap-2 justify-center mt-4'
        }
      });

      if (result.isConfirmed) {
        // Track the complaint
        navigate(`/track?ref=${refId}`);
      } else if (result.isDenied) {
        // Submit another complaint
        resetForm();
      } else {
        // Go to Home page
        navigate('/');
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Unable to submit your grievance. Please ensure all fields are filled properly and try again.',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'rounded-2xl shadow-xl'
        }
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Submit Public Grievance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide issue details below. Your grievance will be logged directly with the Chief Minister's Office.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* District Dropdown */}
          <div>
            <label className="font-medium text-slate-700 block mb-1">District</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <select
                required
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
              >
                <option value="" disabled>-- Pick your District --</option>
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="font-medium text-slate-700 block mb-1">Subject / Headline</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. Major water pipeline leakage flooding junction"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
          </div>

          {/* Description & AI Action */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-slate-700">Detailed Complaint Description</label>
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={aiLoading}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition shadow-sm"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Auto-Analyze with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows="4"
              required
              placeholder="Describe the problem, specific location/ward, and duration..."
              className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-sm"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            {aiMessage && (
              <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mt-1 font-medium">
                {aiMessage}
              </p>
            )}
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Category</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Water Supply, Road Infrastructure"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Priority</label>
              <div className="relative">
                <AlertCircle className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <select
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-70 mt-2"
          >
            {submitLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting to CMO Desk...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Grievance</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}