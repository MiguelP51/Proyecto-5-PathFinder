"use client";

import { useState } from "react";

import AdminTopBar from "@/components/role-based/AdminTopBar";
import AdminSidebar from "@/components/role-based/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      <AdminTopBar
        onMenuClick={() => setSidebarOpen(true)}
      />

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main>
        {children}
      </main>

    </div>
  );
}
