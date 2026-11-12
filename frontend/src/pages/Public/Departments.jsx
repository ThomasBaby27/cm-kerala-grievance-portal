import React from 'react';
export default function Departments() {
  const depts = [
    { name: 'Public Works Department (PWD)', desc: 'Maintenance of state roads, bridges, and infrastructure.' },
    { name: 'Health & Family Welfare', desc: 'Government hospitals, primary health centers, and public medicine supply.' },
    { name: 'Kerala State Electricity Board (KSEB)', desc: 'Power distribution, power cuts, lines, and transformer repairs.' },
    { name: 'Kerala Water Authority (KWA)', desc: 'Drinking water distribution and pipeline leak management.' },
    { name: 'Revenue & Land Records', desc: 'Land mutation, certificates, survey disputes, and flood relief.' }
  ];
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Departments Directory</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {depts.map((d, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border">
            <h3 className="font-bold text-slate-900 mb-1">{d.name}</h3>
            <p className="text-xs text-slate-500">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
