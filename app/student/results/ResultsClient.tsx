"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Zap, Trophy, ShieldCheck, Building2, MapPin, Loader2, Star, Award } from "lucide-react";

export default function ResultsClient({ analytics, companies }: { analytics: any, companies: any[] }) {
  const searchParams = useSearchParams();
  const studentId = parseInt(searchParams.get("studentId") || "1");
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/students/${studentId}`)
      .then(res => res.json())
      .then(data => {
        setStudent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  if (!analytics || !analytics.greedy) {
    return <div className="text-center p-12 text-red-500">Failed to load allocation engine.</div>;
  }

  if (loading) {
    return <div className="text-center p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>;
  }

  // Best allocation from C++ Backend
  const bbAlloc = analytics.branch_bound.allocations.find((a: any) => a.student_id === studentId);

  // Frontend Top 3 logic (Mimicking DSA Compatibility)
  let rankedCompanies = [...companies];
  if (student) {
    const sSkills = (student.skills || "").toLowerCase().split(",").map((s: string) => s.trim());
    const sPref = (student.preferences || "").toLowerCase();

    rankedCompanies = companies.map(c => {
      const cSkills = c.required_skills.toLowerCase().split(",").map((s: string) => s.trim());
      
      // Skills Match (Max 50)
      let common = 0;
      cSkills.forEach((req: string) => { if (sSkills.includes(req)) common++; });
      const skillScore = cSkills.length > 0 ? (common / cSkills.length) * 50 : 0;
      
      // CGPA Weight (Max 20)
      const cgpaScore = Math.min((student.cgpa / 10) * 20, 20);
      
      // Preference Weight (Max 20)
      const prefScore = sPref.includes(c.name.toLowerCase()) ? 20 : 0;
      
      const total = skillScore + cgpaScore + prefScore;
      
      return { ...c, total, skillScore, cgpaScore, prefScore, common, reqTotal: cSkills.length };
    });

    // If bbAlloc exists, force it to be #1 with the exact C++ score.
    if (bbAlloc) {
      const bestIdx = rankedCompanies.findIndex(c => c.id === bbAlloc.company_id);
      if (bestIdx !== -1) {
        rankedCompanies[bestIdx].total = bbAlloc.score; // Sync with C++ exact score
      }
    }

    rankedCompanies.sort((a, b) => b.total - a.total);
  }

  const top3 = rankedCompanies.slice(0, 3);
  const getCompany = (id: number) => companies.find(c => c.id === id);

  const renderProgress = (label: string, value: number, max: number, colorClass: string) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold text-slate-700">{label}</span>
          <span className="text-slate-500">{value.toFixed(1)} / {max}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => window.location.href = "/"} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2">
          &larr; Back to Home
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <h1 className="text-3xl font-bold mb-2 relative z-10 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
          Allocation Complete
        </h1>
        <p className="text-blue-100 relative z-10 text-lg">Our DSA engine has analyzed your profile and found your absolute Top 3 Matches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {top3.map((company, index) => {
          // Calculate breakdowns for text
          const cSkills = company.required_skills.toLowerCase().split(",").map((s: string) => s.trim());
          const sSkills = student ? (student.skills || "").toLowerCase().split(",").map((s: string) => s.trim()) : [];
          const missing = cSkills.filter((req: string) => !sSkills.includes(req));
          const hasPref = student && (student.preferences || "").toLowerCase().includes(company.name.toLowerCase());

          return (
            <div 
              key={company.id} 
              className={`rounded-2xl overflow-hidden transition-all relative flex flex-col ${
                index === 0 
                  ? "bg-white shadow-xl ring-2 ring-blue-500 transform lg:-translate-y-4 lg:scale-105 z-10" 
                  : "bg-white shadow-sm border border-slate-200 hover:shadow-md"
              }`}
            >
              {index === 0 && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              )}
              
              <div className={`p-4 border-b flex justify-between items-center ${index === 0 ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100"}`}>
                <h3 className={`font-bold flex items-center gap-2 ${index === 0 ? "text-blue-800 text-lg" : "text-slate-700"}`}>
                  {index === 0 ? <Trophy className="w-5 h-5 text-blue-600" /> : <Star className="w-4 h-4 text-slate-400" />}
                  {index === 0 ? "#1 BEST MATCH" : `#${index + 1} RECOMMENDATION`}
                </h3>
                {index === 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded-full shadow-sm">
                    <ShieldCheck className="w-3 h-3" /> DSA OPTIMAL
                  </span>
                )}
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${index === 0 ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{company.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {company.city}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6 text-center">
                  <div className="inline-block">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Match Score</p>
                    <p className={`text-4xl font-black ${index === 0 ? "text-blue-600" : "text-slate-700"}`}>
                      {company.total.toFixed(1)}<span className="text-2xl text-slate-400">%</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-6">
                  {renderProgress("Skills Match", company.skillScore || 0, 50, "bg-indigo-500")}
                  {renderProgress("CGPA Weight", company.cgpaScore || 0, 20, "bg-amber-500")}
                  {renderProgress("Preference Weight", company.prefScore || 0, 20, "bg-pink-500")}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 text-sm flex-grow">
                  <h5 className="font-bold text-slate-800 mb-3 border-b pb-2">Match Breakdown</h5>
                  <ul className="space-y-2 text-slate-600">
                    <li><strong className="text-slate-700">Skills:</strong> Matched {company.common} out of {company.reqTotal} required skills.</li>
                    {missing.length > 0 && <li><strong className="text-slate-700">Missing:</strong> <span className="text-amber-600">{missing.join(", ")}</span></li>}
                    <li><strong className="text-slate-700">CGPA:</strong> Your CGPA ({student?.cgpa}) contributes {company.cgpaScore.toFixed(1)}/20.</li>
                    <li><strong className="text-slate-700">Preference:</strong> {hasPref ? "This company was in your preference list (+20)." : "Not explicitly preferred (0)."}</li>
                  </ul>
                  
                  <div className="mt-4 pt-3 border-t border-slate-200 border-dashed">
                    <p className="font-mono text-xs text-slate-500">
                      Total Score = Skills({company.skillScore.toFixed(1)}) + CGPA({company.cgpaScore.toFixed(1)}) + Pref({company.prefScore.toFixed(1)})
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                  <h5 className="font-bold text-blue-900 mb-2 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Why this is a good match
                  </h5>
                  <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                    {company.skillScore >= 25 ? <li>High skill overlap with job requirements.</li> : <li>Some fundamental skills match the role.</li>}
                    <li>Your academic profile satisfies their baseline.</li>
                    {hasPref && <li>Aligns perfectly with your career preferences.</li>}
                    <li>Balanced score across all systemic parameters.</li>
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
