import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12 pb-12">
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold">Direct Grievance Redressal to Chief Minister's Office</h1>
          <p className="text-emerald-100 text-base md:text-lg max-w-2xl mx-auto">
            Transparent, AI-assisted grievance classification and real-time lifecycle tracking across all 14 districts of Kerala.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link to="/submit" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-lg flex items-center gap-2">
              <Send className="w-4 h-4" /> Submit Grievance
            </Link>
            <Link to="/track" className="bg-emerald-950/70 border border-emerald-400/40 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-300" /> Track Grievance
            </Link>
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border text-center">
          <div className="text-3xl font-extrabold text-emerald-700">14</div>
          <div className="text-xs text-slate-500">Districts</div>
        </div>
        <div className="bg-white p-4 rounded-xl border text-center">
          <div className="text-3xl font-extrabold text-emerald-700">100%</div>
          <div className="text-xs text-slate-500">CMO Oversight</div>
        </div>
        <div className="bg-white p-4 rounded-xl border text-center">
          <div className="text-3xl font-extrabold text-emerald-700">{"< 48 hrs"}</div>
          <div className="text-xs text-slate-500">Review Time</div>
        </div>
        <div className="bg-white p-4 rounded-xl border text-center">
          <div className="text-3xl font-extrabold text-emerald-700">AI</div>
          <div className="text-xs text-slate-500">Smart Routing</div>
        </div>
      </section>
    </div>
  );
}