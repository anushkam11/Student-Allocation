"use client";

import { useEffect, useState } from "react";
import { Building2, MapPin, Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompaniesClientPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "high" | "applied">("all");

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    
    Promise.all([
      fetch("http://127.0.0.1:8000/companies/").then(res => res.json()),
      studentId ? fetch(`http://127.0.0.1:8000/students/${studentId}`).then(res => res.json()).catch(() => null) : Promise.resolve(null)
    ]).then(([comps, stud]) => {
      setCompanies(comps);
      setStudent(stud);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleApply = async (companyName: string, companyId: number) => {
    if (!student) {
      alert("Please login first to apply!");
      router.push("/student/login");
      return;
    }
    
    setApplying(companyId);
    
    try {
      // Append company name to preferences
      const currentPrefs = student.preferences ? student.preferences.split(",").map((s:string) => s.trim()) : [];
      if (!currentPrefs.includes(companyName)) {
        currentPrefs.push(companyName);
      }
      
      const newPrefs = currentPrefs.join(", ");
      
      // Update student profile
      await fetch(`http://127.0.0.1:8000/students/${student.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: student.name,
          branch: student.branch,
          cgpa: student.cgpa,
          skills: student.skills,
          preferences: newPrefs
        })
      });

      setStudent({ ...student, preferences: newPrefs });
      router.push(`/student/results?studentId=${student.id}`);
    } catch (e) {
      alert("Failed to apply.");
      setApplying(null);
    }
  };

  if (loading) return <div className="text-center p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>;

  const sSkills = student ? (student.skills || "").toLowerCase().split(",").map((s:string) => s.trim()) : [];

  const filteredCompanies = companies.filter(company => {
    const cSkills = company.required_skills.toLowerCase().split(",").map((s:string) => s.trim());
    let common = 0;
    cSkills.forEach((req:string) => { if (sSkills.includes(req)) common++; });
    const matchPercent = cSkills.length > 0 ? Math.round((common / cSkills.length) * 100) : 0;
    const isApplied = student && (student.preferences || "").toLowerCase().includes(company.name.toLowerCase());

    if (filter === "high") return matchPercent >= 70;
    if (filter === "applied") return isApplied;
    return true; // "all"
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Partner Companies</h1>
          <p className="text-slate-500 mt-2">Explore the companies participating in our DSA allocation engine.</p>
          {!student && <p className="text-amber-600 bg-amber-50 p-3 mt-4 rounded-lg border border-amber-200">You are browsing as a guest. Login to see Match % and apply.</p>}
        </div>
        
        {student && (
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filter === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>All Jobs</button>
            <button onClick={() => setFilter("high")} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filter === "high" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>High Match (&gt;70%)</button>
            <button onClick={() => setFilter("applied")} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filter === "applied" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Applied Jobs</button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company: any) => {
          const cSkills = company.required_skills.toLowerCase().split(",").map((s:string) => s.trim());
          let common = 0;
          cSkills.forEach((req:string) => { if (sSkills.includes(req)) common++; });
          const matchPercent = cSkills.length > 0 ? Math.round((common / cSkills.length) * 100) : 0;
          const isApplied = student && (student.preferences || "").toLowerCase().includes(company.name.toLowerCase());
          const isLowMatch = matchPercent < 20;

          return (
            <div key={company.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
              {student && (
                <div className={`absolute top-0 right-0 px-3 py-1 font-bold text-sm rounded-bl-xl border-b border-l ${matchPercent >= 70 ? 'bg-green-50 text-green-700 border-green-100' : matchPercent < 20 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                  {matchPercent}% MATCH
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4 mt-2">
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                  <Building2 className="w-8 h-8" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">{company.name}</h3>
              
              <div className="mt-4 space-y-2 text-sm text-slate-600 flex-grow">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {company.city}</p>
                <p className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {company.open_roles} Open Roles</p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 mb-6">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {company.required_skills.split(",").map((skill: string, i: number) => {
                    const skillName = skill.trim();
                    const hasSkill = student && sSkills.includes(skillName.toLowerCase());
                    return (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full border ${hasSkill ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        {skillName}
                      </span>
                    )
                  })}
                </div>
              </div>

              <button 
                onClick={() => handleApply(company.name, company.id)}
                disabled={applying === company.id || isApplied || (student && isLowMatch)}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                  isApplied 
                    ? "bg-green-100 text-green-700 cursor-default" 
                    : student && isLowMatch
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {applying === company.id ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isApplied ? <><CheckCircle2 className="w-5 h-5" /> Applied</> : student && isLowMatch ? "Low Match" : "Apply Now"}
              </button>
            </div>
          );
        })}
        {filteredCompanies.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No companies match your selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
