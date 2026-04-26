import Link from "next/link";
import { GraduationCap, ShieldCheck, Briefcase } from "lucide-react";

export default function RootLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-16 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-blue-200">
          <Briefcase className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          JobMatch <span className="text-blue-600">Allocation Portal</span>
        </h1>
        <p className="text-lg text-slate-600 mb-12 max-w-xl mx-auto leading-relaxed">
          The ultimate Data Structures & Algorithms powered platform connecting students with their dream companies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link 
            href="/student/login"
            className="group relative bg-white border-2 border-slate-200 p-6 rounded-2xl hover:border-blue-600 hover:shadow-xl transition-all flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Student Login</h2>
            <p className="text-sm text-slate-500">Register your profile and get instantly allocated to a company.</p>
          </Link>

          <Link 
            href="/admin/login"
            className="group relative bg-slate-900 border-2 border-slate-900 p-6 rounded-2xl hover:bg-slate-800 hover:shadow-xl transition-all flex flex-col items-center text-center text-white"
          >
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Admin Login</h2>
            <p className="text-sm text-slate-300">View analytics, student lists, and deep DSA comparisons.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
