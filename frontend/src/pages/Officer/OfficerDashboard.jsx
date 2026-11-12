import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function OfficerDashboard() {
  const [grievances, setGrievances] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [actionReport, setActionReport] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/api/officer/grievances');
      setGrievances(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleResolve = async () => {
    if (!actionReport) { alert('Enter Action-Taken Report'); return; }
    try {
      await api.patch('/api/grievances/' + selectedGrievance.id + '/officer-action', {
        action_report: actionReport,
        status: 'Resolved'
      });
      alert('Resolved!');
      setSelectedGrievance(null);
      setActionReport('');
      loadData();
    } catch {
      alert('Failed to resolve');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4 text-xs">
      <h1 className="text-2xl font-bold text-slate-900">Department Officer Action Desk</h1>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-500">
            <tr><th className="p-3">Ref ID</th><th className="p-3">Subject</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y">
            {grievances.map(g => (
              <tr key={g.id}>
                <td className="p-3 font-mono font-bold">{g.reference_id}</td>
                <td className="p-3">{g.subject}</td>
                <td className="p-3">{g.status}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setSelectedGrievance(g)} className="bg-emerald-800 text-white px-2 py-1 rounded">Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedGrievance && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-xl max-w-md w-full space-y-3">
            <div className="flex justify-between font-bold"><span>Resolve {selectedGrievance.reference_id}</span><button onClick={() => setSelectedGrievance(null)}>?</button></div>
            <textarea rows="3" className="w-full border p-2 rounded" placeholder="Action-Taken Report" value={actionReport} onChange={e => setActionReport(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedGrievance(null)} className="border px-3 py-1 rounded">Cancel</button>
              <button onClick={handleResolve} className="bg-emerald-800 text-white px-3 py-1 rounded">Submit ATR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
