"use client";

import { Button } from "@/components/ui/button";

export function ProfileHeader({
  onSave,
  onSkip,
  isSaving,
  hideSkip,
}: {
  onSave: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  hideSkip?: boolean;
}) {
  return (
    <header className="sticky top-16 z-20 w-full border-b border-slate-200 bg-white/95 backdrop-blur">

      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

        {/* Título */}
        <h1 className="text-lg font-semibold text-[#0E3E66] md:text-xl">
          Configuración de Perfil
        </h1>

        {/* Acciones */}
        <div className="flex items-center gap-3">

          {!hideSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-slate-600 hover:text-slate-800"
            >
              Omitir
            </Button>
          )}

          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-[#0E3E66] text-white hover:bg-[#0E3E66]/90"
          >
            {isSaving ? "Guardando..." : "Guardar y Continuar"}
          </Button>

        </div>

      </div>

    </header>
  );
}