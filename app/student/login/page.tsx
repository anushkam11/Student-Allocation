import StudentLoginClient from "./StudentLoginClient";

export default function StudentLoginPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Student Profile & Login</h1>
        <p className="text-slate-500 mt-2">Fill your details to get instantly allocated to a company</p>
      </div>
      <StudentLoginClient />
    </div>
  );
}
