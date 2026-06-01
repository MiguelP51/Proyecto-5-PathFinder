"use client";

import { useState } from "react";

import AuthenticatedTopBar from "@/components/AuthenticatedTopBar";
import AuthenticatedSidebar from "@/components/AuthenticatedSidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      <AuthenticatedTopBar
        onMenuClick={() => setSidebarOpen(true)}
      />

      <AuthenticatedSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main>
        {children}
      </main>

    </div>
  );
}