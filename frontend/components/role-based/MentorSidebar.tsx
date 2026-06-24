"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import styles from "../../styles/PathMentorNavbar.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MentorSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  /* DYNAMIC SIDEBAR WIDTH & RESIZE LISTENER */
  useEffect(() => {
    // Since the sidebar is an overlay on all resolutions, it never pushes page content
    document.documentElement.style.setProperty("--sidebar-width", "0px");
  }, []);

  const userName = session?.user?.name || "Mentor";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image || session?.user?.avatarUrl || "";

  // Helper to check if a route is active
  const isActive = (route: string) => {
    return pathname === route;
  };

  const navLinks = [
    { label: "Dashboard", href: "/mentor/home", icon: "📊" },
    { label: "Mis Entrevistas", href: "/mentor/interviews", icon: "📅" },
    { label: "Disponibilidad", href: "/mentor/availability", icon: "🕒" },
    { label: "Feedback", href: "/mentor/feedbacks", icon: "💬" },
    { label: "Mis Métricas", href: "/mentor/metrics", icon: "📈" },
    { label: "Mi Perfil", href: "/mentor/profile", icon: "👤" },
  ];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[190] bg-black/45 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-[200] flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xl transition-all duration-300
          w-full h-auto max-h-[85vh] border-b rounded-b-3xl overflow-y-auto
          md:h-full md:max-h-full md:border-r md:border-b-0 md:rounded-b-none
          ${open 
            ? "translate-y-0 md:translate-x-0 md:translate-y-0" 
            : "-translate-y-full md:-translate-x-full md:translate-y-0"
          }
          md:w-[320px]
        `}
      >
        {/* Close Button on Mobile Drawer */}
        {open && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* HEADER */}
        <div className={styles.sidebarHeader}>
          <Link href="/mentor/home" className="flex items-center">
            <Image
              src="/assets/logo-pf.png"
              alt="PathFinder"
              width={118}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* USER INFO BAR (NextAuth Session) */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-850/50">
          {userImage ? (
            <img
              src={userImage}
              alt="avatar"
              className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
              {userName}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>

        {/* NAV */}
        <div className={styles.topSection}>
          <p className={styles.panelTitle}>PANEL MENTOR</p>

          <nav className={styles.navLinks}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={
                  isActive(link.href) ? styles.activeLink : styles.link
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  gap: "12px",
                  padding: "0 18px",
                  fontSize: "16px",
                }}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* FOOTER */}
        <div className={styles.bottomSection + " flex flex-col gap-3"}>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-red-500 hover:bg-red-50 font-semibold border border-transparent hover:border-red-100 transition-all duration-200 text-sm"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
