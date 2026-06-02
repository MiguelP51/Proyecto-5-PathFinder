"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import AdminTopBar from "@/components/role-based/AdminTopBar";
import AdminSidebar from "@/components/role-based/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Validar rol del lado del cliente
  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session?.user?.rol?.toLowerCase();
      if (userRole && userRole !== "admin") {
        // Usuario con rol incorrecto, redirigir a su home
        router.replace(`/${userRole}/home`);
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router]);

  // No renderizar contenido protegido hasta validar
  if (status === "loading" || (status === "authenticated" && session?.user?.rol?.toLowerCase() !== "admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0E3E66]">Validando...</h1>
          <p className="text-slate-600 mt-2">Un momento por favor.</p>
        </div>
      </div>
    );
  }

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
