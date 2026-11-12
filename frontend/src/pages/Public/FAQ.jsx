import React from 'react';
export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h1>
      <div className="bg-white p-5 rounded-xl border space-y-2">
        <h3 className="font-bold text-sm text-slate-800">How do I track my complaint?</h3>
        <p className="text-xs text-slate-600">Use the unique Reference ID provided immediately after submission on the Track Grievance page.</p>
      </div>
      <div className="bg-white p-5 rounded-xl border space-y-2">
        <h3 className="font-bold text-sm text-slate-800">Does the AI make final official decisions?</h3>
        <p className="text-xs text-slate-600">No. The AI provides suggested categories, departments, and summaries. All administrative decisions are taken by officers.</p>
      </div>
    </div>
  );
}
