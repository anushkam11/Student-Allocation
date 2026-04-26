// app/student/utils/studentStore.ts

export interface Student {
  id: number;
  name: string;
  email: string;
  password: string;
  branch: string;
  cgpa: number;
  skills: string; // comma separated
  preferences: string; // comma separated
}

// Simple O(1) hashmap keyed by email
const studentMap: Record<string, Student> = {};

export const addStudent = (student: Student) => {
  studentMap[student.email] = student;
};

export const getStudentByEmail = (email: string): Student | undefined => {
  return studentMap[email];
};

export const getAllStudents = (): Student[] => {
  return Object.values(studentMap);
};
