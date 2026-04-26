"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, UserCircle2, LogOut } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const handleLogout = () => {
    // Add logout logic here (e.g., clearing auth tokens)
    router.push("/login");
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Naukri-style Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/student" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  N
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">JobMatch</span>
              </Link>
              
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link href="/student/jobs" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </Link>
                <Link href="/student/companies" className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-slate-900">
                  <Building2 className="w-4 h-4 mr-2" />
                  Companies
                </Link>
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
              <button className="p-1 rounded-full text-slate-400 hover:text-slate-500">
                <UserCircle2 className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
