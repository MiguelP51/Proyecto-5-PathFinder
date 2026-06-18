"use client";

import { useState, useEffect } from "react";

import UserTopBar from "@/components/role-based/UserTopBar";
import UserSidebar from "@/components/role-based/UserSidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-slate-50 transition-all duration-300 ${sidebarOpen ? "md:pl-72" : "md:pl-0"}`}>

      <UserTopBar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <UserSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main>
        {children}
      </main>

    </div>
  );
}