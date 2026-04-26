import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student-Company Allocation",
  description: "DSA project demonstrating advanced allocation algorithms",
};

import { StudentProvider } from "./student/context/StudentContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased min-h-screen bg-slate-50 text-slate-900`}>
        <StudentProvider>
          {children}
        </StudentProvider>
      </body>
    </html>
  );
}
