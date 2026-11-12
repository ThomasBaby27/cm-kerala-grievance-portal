import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';
import { Search, Clock } from 'lucide-react';

export default function TrackGrievance() {
  const [searchParams] = useSearchParams();
  const [refId, setRefId] = useState(searchParams.get('ref') || '');
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async (idToSearch) => {
    if (!idToSearch) return;
    setLoading(true);
    setError('');
    setGrievance(null);
    try {
      const res = await api.get('/api/grievances/track/' + idToSearch.trim());
      setGrievance(res.data);
    } catch {
      setError('No grievance found with this Reference ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refId) fetchStatus(refId);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 text-center">Track Grievance Status</h1>
      <div className="bg-white p-4 rounded-xl border flex gap-2">
        <input type="text" placeholder="Enter Reference ID (e.g. KL-2026-XXXX)" className="flex-1 border rounded p-2 text-xs font-mono" value={refId} onChange={e => setRefId(e.target.value)} />
        <button onClick={() => fetchStatus(refId)} className="bg-emerald-800 text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-1"><Search className="w-3 h-3" /> Track</button>
      </div>
      {loading && <div className="text-center text-xs text-slate-500">Loading...</div>}
      {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">{error}</div>}
      {grievance && (
        <div className="bg-white p-6 rounded-xl border space-y-4 text-xs">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">{grievance.reference_id}</span>
              <h2 className="text-base font-bold text-slate-900 mt-1">{grievance.subject}</h2>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-bold uppercase">{grievance.status}</span>
          </div>
          <p className="bg-slate-50 p-3 rounded text-slate-700">{grievance.description}</p>
          <div className="border-t pt-3 space-y-2">
            <div className="font-bold text-slate-700 flex items-center gap-1"><Clock className="w-3 h-3" /> History Timeline</div>
            <div className="space-y-2 pl-3 border-l-2 border-emerald-300">
              {grievance.history && grievance.history.map((h, i) => (
                <div key={i} className="text-slate-600">
                  <span className="font-bold text-emerald-800">{h.new_status}</span> - {new Date(h.timestamp).toLocaleDateString()}
                  {h.remarks && <div className="text-slate-500 italic">{h.remarks}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
