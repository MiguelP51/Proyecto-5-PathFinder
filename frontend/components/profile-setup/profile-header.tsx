"use client";

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import styles from "../../styles/Navbar.module.css";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "U";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileHeader({
  onSave,
  onSkip,
  isSaving,
}: {
  onSave: () => void;
  onSkip: () => void;
  isSaving?: boolean;
}) {
  const { data: session } = useSession();
  const name = session?.user?.name || "Usuario conectado";
  const email = session?.user?.email || "";
  const image = session?.user?.image || session?.user?.avatarUrl || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/">
                    <img src="/assets/logo-pf.png" alt="Logo" className={styles.logoImg} />
                </Link>
        </div>

        {/* Title - Center */}
        <h1 className="hidden text-xl font-semibold text-[#0E3E66] md:block">
          Configuración de Perfil
        </h1>

        <div className="hidden min-w-0 items-center gap-3 lg:flex">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Sesion activa
          </span>
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
            {image ? (
              <img
                src={image}
                alt={name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-xs font-bold text-white">
                {getInitials(name, email)}
              </span>
            )}
            <span className="max-w-48 truncate pr-2 text-sm font-semibold text-[#0E3E66]">
              {name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-slate-600 hover:text-slate-800"
          >
            Omitir
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-[#0E3E66] text-white hover:bg-[#0E3E66]/90"
          >
            {isSaving ? "Guardando..." : "Guardar y Continuar"}
          </Button>
        </div>
      </div>
      {/* Mobile Title */}
      <div className="border-t border-slate-100 py-2 md:hidden">
        <h1 className="text-center text-lg font-semibold text-[#0E3E66]">
          Configuración de Perfil
        </h1>
      </div>
    </header>
  );
}
