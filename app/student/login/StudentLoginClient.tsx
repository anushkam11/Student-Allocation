"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, LogIn, UserPlus } from "lucide-react";
import { useStudentContext } from "../context/StudentContext";

export default function StudentLoginClient() {
  const router = useRouter();
  const { addStudent, getStudentByEmail } = useStudentContext();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (isLogin) {
        // Fast local O(1) hashmap check
        const localStudent = getStudentByEmail(email);
        if (localStudent && localStudent.password === password) {
          localStorage.setItem("studentId", localStudent.id.toString());
          router.push(`/student/results?studentId=${localStudent.id}`);
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/students/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        
        if (!res.ok) {
          alert("Invalid email or password!");
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        
        // Cache the login into O(1) store
        addStudent(data);

        localStorage.setItem("studentId", data.id);
        router.push(`/student/results?studentId=${data.id}`);

      } else {
        // SIGNUP FLOW
        const name = formData.get("name") as string;
        const branch = formData.get("branch") as string;
        const cgpa = parseFloat(formData.get("cgpa") as string);
        const skills = formData.get("skills") as string;
        const preferences = formData.get("preferences") as string;

        // 1. Create Student
        const res = await fetch("http://127.0.0.1:8000/students/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            college_id: "C" + Math.floor(Math.random() * 1000),
            branch: branch
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          if (errorData.detail === "Email already registered") {
            alert("Email already registered. Please login instead.");
            setLoading(false);
            return;
          }
          throw new Error("Failed to register");
        }
        
        const newStudent = await res.json();

        // 2. Update Profile
        await fetch(`http://127.0.0.1:8000/students/${newStudent.id}/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            branch: branch,
            cgpa: cgpa,
            skills: skills,
            preferences: preferences || ""
          })
        });

        // Add full student details to the local O(1) store
        addStudent({
          id: newStudent.id,
          name,
          email,
          password,
          branch,
          cgpa,
          skills,
          preferences: preferences || ""
        });

        // 3. Navigate
        localStorage.setItem("studentId", newStudent.id);
        router.push(`/student/results?studentId=${newStudent.id}`);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Make sure the backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      {/* Toggle */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
        <button 
          onClick={() => setIsLogin(true)} 
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-colors ${isLogin ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <LogIn className="w-4 h-4" /> Login
        </button>
        <button 
          onClick={() => setIsLogin(false)} 
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-colors ${!isLogin ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <UserPlus className="w-4 h-4" /> Sign Up
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-6 animate-in fade-in">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input name="name" required={!isLogin} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter your full name" />
            </div>
          )}
          
          <div className={isLogin ? "md:col-span-2" : ""}>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email ID</label>
            <input name="email" type="email" required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email address" />
          </div>

          <div className={isLogin ? "md:col-span-2" : ""}>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input name="password" type="password" required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Password" />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Branch</label>
                <input name="branch" required={!isLogin} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CGPA</label>
                <input name="cgpa" type="number" step="0.1" max="10" required={!isLogin} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="9.5" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Skills (Comma Separated)</label>
                <input name="skills" required={!isLogin} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Java, Python, React, Machine Learning" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Preferences (Optional)</label>
                <input name="preferences" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Google, Amazon, TCS (ordered priority)" />
              </div>
            </>
          )}
        </div>

        {!isLogin && (
          <div className="border-t border-slate-200 pt-6 mt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Resume Upload (Optional)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
              <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Click to upload your Resume</p>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Processing..." : (isLogin ? "Login to Dashboard" : "Sign Up & Get Allocated")}
          </button>
        </div>
      </form>
    </div>
  );
}
