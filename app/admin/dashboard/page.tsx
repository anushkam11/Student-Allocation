import AdminDashboardTabs from "./AdminDashboardTabs";

async function fetchAnalytics() {
  try {
    const res = await fetch("http://127.0.0.1:8000/admin/allocate/compare", { 
      method: "POST", 
      cache: "no-store" 
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function fetchStudents() {
  try {
    const res = await fetch("http://127.0.0.1:8000/students/", { cache: "no-store" });
    return await res.json();
  } catch (e) {
    return [];
  }
}

async function fetchCompanies() {
  try {
    const res = await fetch("http://127.0.0.1:8000/companies/", { cache: "no-store" });
    return await res.json();
  } catch (e) {
    return [];
  }
}

export default async function AdminDashboardPage() {
  const analytics = await fetchAnalytics();
  const students = await fetchStudents();
  const companies = await fetchCompanies();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white pb-24 pt-8 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Admin Control Center</h1>
            <p className="text-slate-400 mt-2">Deep Data Structures & Algorithms Analysis</p>
          </div>
          <a href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-700">
            Logout
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 -mt-16 pb-12">
        <AdminDashboardTabs analytics={analytics} students={students} companies={companies} />
      </div>
    </div>
  );
}
