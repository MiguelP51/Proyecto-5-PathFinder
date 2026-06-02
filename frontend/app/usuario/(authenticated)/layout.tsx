"use client";

import { useState } from "react";

import UserTopBar from "@/components/role-based/UserTopBar";
import UserSidebar from "@/components/role-based/UserSidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      <UserTopBar
        onMenuClick={() => setSidebarOpen(true)}
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