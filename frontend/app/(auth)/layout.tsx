"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import UserTopBar from "@/components/role-based/UserTopBar";
import UserSidebar from "@/components/role-based/UserSidebar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detectar ancho de pantalla para inicializar el sidebar en desktop
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  const isStudent = status === "authenticated" && session?.user?.rol?.toLowerCase() === "user";

  if (isStudent) {
    return (
      <div className={`min-h-screen bg-slate-50 transition-all duration-300 ${sidebarOpen ? "md:pl-72" : "md:pl-0"}`}>
        <UserTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main style={{ marginTop: '80px' }}>{children}</main>
    </div>
  );
}
