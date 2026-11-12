import React, { useState, useEffect } from 'react';
import api from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CMODashboard() {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [departments, setDepartments] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [assignDept, setAssignDept] = useState('');
  const [cmoRemarks, setCmoRemarks] = useState('');

  const loadData = async () => {
    try {
      const [gRes, sRes, dRes] = await Promise.all([
        api.get('/api/grievances'),
        api.get('/api/cmo/stats'),
        api.get('/api/departments')
      ]);
      setGrievances(gRes.data);
      setStats(sRes.data);
      setDepartments(dRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleForward = async () => {
    if (!assignDept) { alert('Select a department'); return; }
    try {
      await api.patch('/api/grievances/' + selectedGrievance.id + '/cmo-action', {
        department_id: parseInt(assignDept),
        remarks: cmoRemarks,
        status: 'In Progress'
      });
      alert('Forwarded to department!');
      setSelectedGrievance(null);
      loadData();
    } catch {
      alert('Error updating grievance.');
    }
  };

  const chartData = [
    { name: 'Pending', count: stats.pending || 0 },
    { name: 'In Progress', count: stats.in_progress || 0 },
    { name: 'Resolved', count: stats.resolved || 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-xs">
      <h1 className="text-2xl font-bold text-slate-900">Chief Minister's Office � Redressal Console</h1>
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-white p-4 rounded-xl border"><div className="text-slate-500 font-semibold">Total</div><div className="text-2xl font-bold text-slate-900">{stats.total || grievances.length}</div></div>
        <div className="bg-white p-4 rounded-xl border"><div className="text-blue-600 font-semibold">Pending</div><div className="text-2xl font-bold text-blue-600">{stats.pending || 0}</div></div>
        <div className="bg-white p-4 rounded-xl border"><div className="text-amber-600 font-semibold">In Progress</div><div className="text-2xl font-bold text-amber-600">{stats.in_progress || 0}</div></div>
        <div className="bg-white p-4 rounded-xl border"><div className="text-emerald-600 font-semibold">Resolved</div><div className="text-2xl font-bold text-emerald-600">{stats.resolved || 0}</div></div>
      </div>
      <div className="bg-white p-4 rounded-xl border h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#047857" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-500 font-semibold">
            <tr>
              <th className="p-3">Ref ID</th>
              <th className="p-3">District</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {grievances.map(g => (
              <tr key={g.id}>
                <td className="p-3 font-mono font-bold">{g.reference_id}</td>
                <td className="p-3">{g.district}</td>
                <td className="p-3">{g.subject}</td>
                <td className="p-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{g.status}</span></td>
                <td className="p-3 text-right">
                  <button onClick={() => setSelectedGrievance(g)} className="bg-emerald-800 text-white px-2 py-1 rounded font-semibold">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedGrievance && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full space-y-3">
            <div className="flex justify-between font-bold text-sm"><span>Review {selectedGrievance.reference_id}</span><button onClick={() => setSelectedGrievance(null)}>?</button></div>
            <p className="bg-slate-50 p-2 rounded">{selectedGrievance.description}</p>
            <select className="w-full border p-2 rounded" value={assignDept} onChange={e => setAssignDept(e.target.value)}>
              <option value="">-- Select Department --</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <textarea rows="2" className="w-full border p-2 rounded" placeholder="CMO Directives" value={cmoRemarks} onChange={e => setCmoRemarks(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedGrievance(null)} className="border px-3 py-1 rounded">Cancel</button>
              <button onClick={handleForward} className="bg-emerald-800 text-white px-3 py-1 rounded font-semibold">Forward</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
