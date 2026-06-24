"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Layers,
  ChevronLeft,
  LayoutDashboard,
  Calendar,
  Clock,
  MessageSquare,
  BarChart3,
  User,
  Home,
  Map,
  Info,
  Mail,
  Target,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MentorSidebar({ open, onClose }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [panelExpanded, setPanelExpanded] = useState(true);
  const [explorarExpanded, setExplorarExpanded] = useState(true);

  const userName = session?.user?.name || "Mentor";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image || session?.user?.avatarUrl || "";

  const initials = userName
    ? userName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "M";

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
        ? "bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-lg shadow-blue-200/50"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-white"
    }`;
  };

  const renderLink = (
    href: string,
    label: string,
    icon: React.ReactNode
  ) => {
    return (
      <Link href={href} className={linkClass(href)} onClick={onClose}>
        {icon}
        <span>{label}</span>
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

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={onClose}
        />
      )}

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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-200">
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

        {/* User Card */}
        <div className="px-6 pb-4 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3">
            {userImage ? (
              <img
                src={userImage}
                alt="avatar"
                className="h-11 w-11 rounded-full object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white text-sm">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {userName}
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {userEmail || "mentor@pathfinder.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Links Container */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Section: PANEL MENTOR */}
          <div className="group relative space-y-1.5">
            {renderAccordionTrigger(
              "Panel Mentor",
              panelExpanded,
              () => setPanelExpanded(!panelExpanded),
              <LayoutDashboard className="h-4 w-4" />
            )}

            {/* Accordion Vertical List */}
            {panelExpanded && (
              <div className="space-y-1.5 pl-2 border-l border-slate-100 dark:border-slate-800 ml-3">
                {renderLink("/mentor/home", "Dashboard", <LayoutDashboard className="h-5 w-5" />)}
                {renderLink("/mentor/interviews", "Mis Entrevistas", <Calendar className="h-5 w-5" />)}
                {renderLink("/mentor/availability", "Disponibilidad", <Clock className="h-5 w-5" />)}
                {renderLink("/mentor/feedbacks", "Feedback", <MessageSquare className="h-5 w-5" />)}
                {renderLink("/mentor/metrics", "Mis Métricas", <BarChart3 className="h-5 w-5" />)}
                {renderLink("/mentor/profile", "Mi Perfil", <User className="h-5 w-5" />)}
              </div>
            )}
          </div>

          {/* Section: EXPLORAR */}
          <div className="group relative space-y-1.5">
            {renderAccordionTrigger(
              "Explorar",
              explorarExpanded,
              () => setExplorarExpanded(!explorarExpanded),
              <Compass className="h-4 w-4" />
            )}

            {/* Accordion Vertical List */}
            {explorarExpanded && (
              <div className="space-y-1.5 pl-2 border-l border-slate-100 dark:border-slate-800 ml-3">
                {renderLink("/", "Inicio", <Home className="h-5 w-5" />)}
                {renderLink("/areas", "Áreas", <Map className="h-5 w-5" />)}
                {renderLink("/about", "Sobre nosotros", <Info className="h-5 w-5" />)}
                {renderLink("/contact", "Contacto", <Mail className="h-5 w-5" />)}
                {renderLink("/simulation", "Simulación", <Target className="h-5 w-5" />)}
              </div>
            )}
          </div>
        </div>

        {/* Footer items */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-1">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
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
