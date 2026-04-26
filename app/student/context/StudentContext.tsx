"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Student, addStudent, getStudentByEmail, getAllStudents } from "../utils/studentStore";

type StudentContextType = {
  students: Record<string, Student>;
  addStudent: (student: Student) => void;
  getStudentByEmail: (email: string) => Student | undefined;
  getAllStudents: () => Student[];
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const useStudentContext = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudentContext must be used within StudentProvider");
  return ctx;
};

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Record<string, Student>>({});

  const _addStudent = (student: Student) => {
    setStudents(prev => ({ ...prev, [student.email]: student }));
    addStudent(student); // keep the utils store in sync
  };

  const _getStudentByEmail = (email: string) => {
    const fromState = students[email];
    if (fromState) return fromState;
    // fallback to utils store (maybe pre‑populated)
    return getStudentByEmail(email);
  };

  const _getAllStudents = () => {
    return Object.values(students);
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        addStudent: _addStudent,
        getStudentByEmail: _getStudentByEmail,
        getAllStudents: _getAllStudents,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};
