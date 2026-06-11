"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { handleSecureLogout } from "@/lib/auth-utils";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Layers,
  ChevronLeft,
  Award,
  LayoutDashboard,
  Compass,
  BookOpen,
  Trophy,
  Calendar,
  Home,
  Map,
  Info,
  Mail,
  Target,
  Settings,
  HelpCircle,
  LogOut,
  Lock,
  User,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserSidebar({ open, onClose }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [statusData, setStatusData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (session?.backendJwt) {
      apiFetch<any>("/api/users/me/status", {}, session.backendJwt)
        .then(setStatusData)
        .catch((err) => console.error("Error fetching status in sidebar:", err));

      apiFetch<any>("/api/users/me", {}, session.backendJwt)
        .then(setUserData)
        .catch((err) => console.error("Error fetching me in sidebar:", err));
    }
  }, [session]);

  const isProfileConfirmed = statusData?.perfilConfirmado || false;
  const isDiscCompleted = statusData?.etapas?.TEST_DISC === "COMPLETADA";

  const [espacioExpanded, setEspacioExpanded] = useState(true);
  const [explorarExpanded, setExplorarExpanded] = useState(true);

  const renderLink = (
    href: string,
    label: string,
    icon: React.ReactNode,
    isLocked: boolean
  ) => {
    if (isLocked) {
      return (
        <div
          className="flex items-center justify-between rounded-xl p-3 text-sm font-semibold text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/50"
          title="Completa los pasos previos para desbloquear esta sección"
        >
          <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
          </div>
          <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>
      );
    }

    return (
      <Link href={href} className={linkClass(href)} onClick={onClose}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  const renderHorizontalLink = (
    href: string,
    label: string,
    icon: React.ReactNode,
    isLocked: boolean
  ) => {
    if (isLocked) {
      return (
        <div
          className="flex flex-col items-center justify-center rounded-xl p-3.5 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/50 w-24 h-24 border border-slate-100/50 dark:border-slate-800/50"
          title="Completa los pasos previos para desbloquear esta sección"
        >
          {icon}
          <span className="mt-1.5 line-clamp-2">{label}</span>
          <Lock className="h-3.5 w-3.5 mt-1 text-slate-400 dark:text-slate-500" />
        </div>
      );
    }

    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`flex flex-col items-center justify-center rounded-xl p-3.5 text-center text-xs font-semibold w-24 h-24 transition-all duration-200 border ${
          active
            ? "bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-white border-transparent shadow-lg shadow-purple-200/50"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#7447D7] dark:hover:text-white border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
        }`}
        onClick={onClose}
      >
        {icon}
        <span className="mt-1.5 line-clamp-2">{label}</span>
      </Link>
    );
  };

  const renderAccordionTrigger = (
    label: string,
    isExpanded: boolean,
    onToggle: () => void,
    icon: React.ReactNode
  ) => {
    return (
      <div 
        onClick={onToggle}
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="text-xs font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="text-slate-400 dark:text-slate-500 transition-transform duration-200">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      </div>
    );
  };

  const image =
    session?.user?.image ||
    session?.user?.avatarUrl ||
    "";

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href || pathname === "/home";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkClass = (href: string) => {
    const active = isActive(href);
    return `flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-[#7447D7] to-[#D43EE6] text-white shadow-lg shadow-purple-200/50"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#7447D7] dark:hover:text-white"
    }`;
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex flex-col bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300
          w-full h-auto max-h-[85vh] border-b border-slate-100 dark:border-slate-800 rounded-b-3xl
          md:w-72 md:h-full md:max-h-full md:border-r md:border-b-0 md:rounded-b-none
          ${open 
            ? "translate-y-0 md:translate-x-0 md:translate-y-0" 
            : "-translate-y-full md:-translate-x-full md:translate-y-0"
          }`}
      >
        {/* Header - Logo */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-white shadow-md shadow-purple-200">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-black tracking-wide text-slate-800 dark:text-slate-100 text-lg">
              PATHFINDER
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 hidden md:block" />
            <X className="h-5 w-5 md:hidden" />
          </button>
        </div>

        {/* User Card & Level XP */}
        <div className="px-6 pb-4 space-y-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3">
            {image ? (
              <img
                src={image}
                alt="avatar"
                className="h-11 w-11 rounded-full object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] font-bold text-white text-sm">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {userData?.name || session?.user?.name || "Estudiante"}
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {session?.user?.email || "usuario@pathfinder.com"}
              </p>
            </div>
          </div>

          {/* Level Progress (XP Card) */}
          <div className="rounded-xl border border-amber-200/70 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/30 p-3 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm shadow-amber-100/20 dark:shadow-none font-bold">
            <div className="flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
              <span>Nivel 5</span>
            </div>
            <span className="text-amber-600/90 dark:text-amber-400/90">2450/3000 XP</span>
          </div>
        </div>

        {/* Scrollable Links Container */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Section: MI ESPACIO */}
          <div className="group relative space-y-1.5">
            {renderAccordionTrigger("Mi espacio", espacioExpanded, () => setEspacioExpanded(!espacioExpanded), <LayoutDashboard className="h-4 w-4" />)}
            
            {/* Accordion Vertical List */}
            {espacioExpanded && (
              <div className="space-y-1.5 pl-2 border-l border-slate-100 dark:border-slate-800 ml-3">
                {(() => {
                  const miEspacioLinks = [
                    { href: "/user/profile", label: "Mi Perfil", icon: <User className="h-5 w-5" />, isLocked: false },
                    { href: "/user/app/exploracion/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, isLocked: false },
                    { href: "/user/explore", label: "Explorar", icon: <Compass className="h-5 w-5" />, isLocked: !isProfileConfirmed },
                    { href: "/user/app/skillpaths", label: "SkillPaths", icon: <BookOpen className="h-5 w-5" />, isLocked: !isProfileConfirmed },
                    { href: "/user/challenges", label: "Challenges", icon: <Trophy className="h-5 w-5" />, isLocked: !isProfileConfirmed },
                    { 
                      href: statusData?.etapas?.AGENDAMIENTO_ENTREVISTA === "COMPLETADA"
                        ? "/user/app/simulation-details"
                        : "/user/app/simulation-intro",
                      label: "Entrevistas",
                      icon: <Calendar className="h-5 w-5" />,
                      isLocked: !isProfileConfirmed || !isDiscCompleted
                    }
                  ];
                  return miEspacioLinks.map((link) => (
                    <div key={link.label}>
                      {renderLink(link.href, link.label, link.icon, link.isLocked)}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Section: EXPLORAR */}
          <div className="group relative space-y-1.5">
            {renderAccordionTrigger("Explorar", explorarExpanded, () => setExplorarExpanded(!explorarExpanded), <Compass className="h-4 w-4" />)}
            
            {/* Accordion Vertical List */}
            {explorarExpanded && (
              <div className="space-y-1.5 pl-2 border-l border-slate-100 dark:border-slate-800 ml-3">
                {(() => {
                  const explorarLinks = [
                    { href: "/", label: "Inicio", icon: <Home className="h-5 w-5" /> },
                    { href: "/areas", label: "Áreas", icon: <Map className="h-5 w-5" /> },
                    { href: "/about", label: "Sobre nosotros", icon: <Info className="h-5 w-5" /> },
                    { href: "/contact", label: "Contacto", icon: <Mail className="h-5 w-5" /> },
                    { href: "/simulation", label: "Simulación", icon: <Target className="h-5 w-5" /> }
                  ];
                  return explorarLinks.map((link) => (
                    <div key={link.label}>
                      {renderLink(link.href, link.label, link.icon, false)}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Footer items */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-1">
          <button
            onClick={() => handleSecureLogout(session?.backendJwt)}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-sm font-semibold text-red-500 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
