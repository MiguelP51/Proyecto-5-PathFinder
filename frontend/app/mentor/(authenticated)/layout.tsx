"use client";

import { useState } from "react";

import MentorTopBar from "@/components/role-based/MentorTopBar";
import MentorSidebar from "@/components/role-based/MentorSidebar";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      <MentorTopBar
        onMenuClick={() => setSidebarOpen(true)}
      />

      <MentorSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main>
        {children}
      </main>

    </div>
  );
}
