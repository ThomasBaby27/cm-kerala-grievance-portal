import React from 'react';
export default function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 text-center mb-6">How the Grievance Workflow Works</h1>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="bg-white p-5 rounded-xl border"><h3 className="font-bold text-emerald-800 mb-1">1. Citizen Submission</h3><p className="text-slate-600">Citizen submits complaint with AI auto-classification and receives a tracking Reference ID.</p></div>
        <div className="bg-white p-5 rounded-xl border"><h3 className="font-bold text-emerald-800 mb-1">2. CMO Review</h3><p className="text-slate-600">The Chief Minister's Office evaluates the AI summary and assigns it to the competent department.</p></div>
        <div className="bg-white p-5 rounded-xl border"><h3 className="font-bold text-emerald-800 mb-1">3. Officer Action</h3><p className="text-slate-600">Assigned officer inspects the ground reality and files an official Action-Taken Report.</p></div>
        <div className="bg-white p-5 rounded-xl border"><h3 className="font-bold text-emerald-800 mb-1">4. Redressal & Feedback</h3><p className="text-slate-600">Grievance is resolved. Citizen reviews the outcome and can submit ratings or reopen if required.</p></div>
      </div>
    </div>
  );
}
