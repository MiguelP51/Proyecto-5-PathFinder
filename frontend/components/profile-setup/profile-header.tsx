"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import styles from "../../styles/Navbar.module.css";

export function ProfileHeader({
  onSave,
  onSkip,
  isSaving,
}: {
  onSave: () => void;
  onSkip: () => void;
  isSaving?: boolean;
}) {
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

        {/* Actions */}
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
