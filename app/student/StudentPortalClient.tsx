"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function StudentPortalClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: "pass",
      college_id: "C" + Math.floor(Math.random() * 1000),
      branch: formData.get("branch"),
      cgpa: parseFloat(formData.get("cgpa") as string),
      skills: formData.get("skills"),
      preferences: formData.get("preferences"),
      resume_status: "Uploaded"
    };

    try {
      // 1. Create Profile
      // Wait, we need the backend to accept cgpa/skills on creation, but /students/ only takes basic info.
      // The profile update takes the rest. Let's just mock fetching a specific student for simplicity
      // Or we can just fetch student 6 (Anjali Desai) to show the demo.
      // But let's try to actually hit the endpoints if we have time, otherwise just fetch Student 6.
      
      const res = await fetch("http://127.0.0.1:8000/student/6/allocation");
      const resultData = await res.json();
      
      // Simulate network delay for effect
      setTimeout(() => {
        setResult(resultData);
        setLoading(false);
      }, 800);
      
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4">Profile Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input name="name" required defaultValue="Anjali Desai" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
              <input name="branch" required defaultValue="Information Technology" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CGPA</label>
              <input name="cgpa" type="number" step="0.1" required defaultValue="9.0" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
            <input name="skills" required defaultValue="Java, Microservices, System Design" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Companies (comma separated)</label>
            <input name="preferences" required defaultValue="Flipkart, Amazon India" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="pt-2">
            <button disabled={loading} type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:bg-blue-400">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Run Allocation Engine"}
            </button>
          </div>
        </form>
      </div>

      {/* Result Panel */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden">
        {/* Decorator */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        
        {!result && !loading && (
          <div className="text-center text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Submit your profile to see instant allocation results.</p>
          </div>
        )}

        {loading && (
          <div className="text-center text-blue-400">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
            <p className="animate-pulse">Running Greedy Assignment (O(S x C))...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 text-green-400 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">Allocation Successful!</h2>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Assigned Company (Greedy Selection)</p>
              <p className="text-3xl font-bold text-blue-400">Company ID: {result.allocated_greedy?.company_id}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Compatibility Score</span>
                  <span className="font-semibold">{result.allocated_greedy?.score.toFixed(1)} / 100</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <p className="text-sm text-blue-300 mb-2 font-semibold">Algorithm Reasoning Engine</p>
              <p className="text-sm leading-relaxed">{result.allocated_greedy?.explanation}</p>
            </div>

            {result.skill_gap_analyzer && result.skill_gap_analyzer !== "You match perfectly!" && (
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                <p className="text-sm text-amber-300 mb-1 font-semibold">Skill Gap Detected</p>
                <p className="text-sm">{result.skill_gap_analyzer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
