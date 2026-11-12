import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Sparkles, Send, Loader2 } from 'lucide-react';

const DISTRICTS = [
  'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam',
  'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
];

export default function SubmitGrievance() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    district: 'Thiruvananthapuram',
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
    if (!formData.description || formData.description.length < 10) {
      alert('Please enter a description first.');
      return;
    }
    setAiLoading(true);
    setAiMessage('');
    try {
      const res = await api.post('/api/ai/analyze-grievance', {
        description: formData.description,
        district: formData.district,
      });
      const data = res.data;
      setFormData(prev => ({
        ...prev,
        category: data.category || prev.category,
        priority: data.priority || prev.priority,
        ai_summary: data.summary || '',
      }));
      setAiMessage('AI analysis applied: Suggested category and priority updated.');
    } catch {
      alert('AI assistant unavailable, please enter details manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await api.post('/api/grievances', formData);
      alert('Submitted! Reference ID: ' + res.data.reference_id);
      navigate('/track?ref=' + res.data.reference_id);
    } catch {
      alert('Failed to submit grievance.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white p-6 rounded-xl border space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Submit Public Grievance</h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-medium block mb-1">District</label>
            <select className="w-full border p-2 rounded bg-white" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium block mb-1">Subject</label>
            <input type="text" required className="w-full border p-2 rounded" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium">Description</label>
              <button type="button" onClick={handleAiAnalyze} disabled={aiLoading} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-2.5 py-1 rounded flex items-center gap-1 text-[11px]">
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Auto-Analyze with AI
              </button>
            </div>
            <textarea rows="4" required className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            {aiMessage && <p className="text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200 mt-1">{aiMessage}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium block mb-1">Category</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div>
              <label className="font-medium block mb-1">Priority</label>
              <select className="w-full border p-2 rounded bg-white" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={submitLoading} className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded flex justify-center items-center gap-2">
            {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Grievance
          </button>
        </form>
      </div>
    </div>
  );
}
