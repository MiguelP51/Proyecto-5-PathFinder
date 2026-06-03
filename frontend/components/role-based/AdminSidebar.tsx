"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import styles from '@/styles/AdminSidebar.module.css';

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FolderTree,
  Stethoscope,
  BookOpen,
  Target,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  FileText,
  Upload,
  Brain,
  Database,
  Link as LinkIcon,
  UsersRound,
  ChevronRight,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

export default function AdminSidebar({
  open,
  onClose,
}: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuSections: MenuSection[] = [
    {
      title: "General",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin/home" },
        {
          icon: BarChart3,
          label: "Análisis e Indicadores",
          path: "/admin/analytics",
        },
      ],
    },
    {
      title: "Gestión de Usuarios",
      items: [
        { icon: Users, label: "Usuarios", path: "/admin/users" },
        { icon: Shield, label: "Roles y Permisos", path: "/admin/roles" },
        { icon: Upload, label: "Carga Masiva", path: "/admin/bulk-upload" },
      ],
    },
    {
      title: "Evaluaciones",
      items: [
        { icon: Brain, label: "Test Psicométrico", path: "/admin/psychometric" },
        {
          icon: Stethoscope,
          label: "Diagnósticos",
          path: "/admin/diagnostics",
        },
        {
          icon: ClipboardList,
          label: "Tests Adaptativos",
          path: "/admin/adaptive-tests",
        },
      ],
    },
    {
      title: "Contenido",
      items: [
        { icon: FolderTree, label: "Áreas y Subáreas", path: "/admin/areas" },
        { icon: BookOpen, label: "SkillPaths", path: "/admin/skillpaths" },
        { icon: Target, label: "PathChallenges", path: "/admin/challenges" },
        {
          icon: UsersRound,
          label: "Moderación",
          path: "/admin/moderation",
        },
      ],
    },
    {
      title: "Integración y Datos",
      items: [
        {
          icon: Database,
          label: "Sincronización Externa",
          path: "/admin/sync",
        },
        {
          icon: LinkIcon,
          label: "Catálogos de Cursos",
          path: "/admin/course-catalogs",
        },
        {
          icon: FileText,
          label: "Auditoría y Logs",
          path: "/admin/audit",
        },
      ],
    },
    {
      title: "Retroalimentación",
      items: [
        { icon: MessageSquare, label: "Encuestas", path: "/admin/surveys" },
        {
          icon: TrendingUp,
          label: "Avance de Estudiantes",
          path: "/admin/student-progress",
        },
      ],
    },
  ];

  const image =
    session?.user?.image || session?.user?.avatarUrl || "";

  return (
    <>
      {/* Overlay - Mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-20" : "w-64"
        } fixed left-0 top-0 z-50 h-screen bg-gradient-to-b from-[#2D1B4E] to-[#6B46C1] text-white flex flex-col transition-all duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 lg:shadow-lg`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#6B46C1] font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-lg">ADMIN</span>
            </div>
          ) : (
            <Shield className="w-6 h-6" />
          )}
        </div>

        {/* Navigation */}
        <nav className={styles.scrollbarHidden + " flex-1 overflow-y-auto px-2 py-4"}>
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              {!isSidebarCollapsed && (
                <div className="px-4 mb-2 text-xs font-semibold text-purple-200 uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.path ||
                  pathname?.startsWith(item.path + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors mx-2 rounded-lg ${
                      isActive
                        ? "bg-white/20 border-l-4 border-white"
                        : "hover:bg-white/10"
                    } ${isSidebarCollapsed ? "justify-center" : ""}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                    onClick={() => {
                      if (open) onClose();
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex h-12 items-center justify-center border-t border-white/10 hover:bg-white/10 transition-colors w-full"
        >
          <ChevronRight
            className={`w-5 h-5 transition-transform ${
              isSidebarCollapsed ? "" : "rotate-180"
            }`}
          />
        </button>

        {/* Close Button - Mobile */}
        <button
          onClick={onClose}
          className="lg:hidden h-12 flex items-center justify-center border-t border-white/10 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>
    </>
  );
}
