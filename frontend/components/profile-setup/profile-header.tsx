"use client";

import { Button } from "@/components/ui/button";

export function ProfileHeader({
  onSave,
  onSkip,
  onConfirm,
  isSaving,
  isConfirming,
  canConfirm = false,
  completionPercentage = 0,
  pendingItems = [],
  isEditing = true,
  onToggleEdit,
  hasSavedProfile = false,
  hideSkip = false,
}: {
  onSave: () => void;
  onSkip: () => void;
  onConfirm?: () => void;
  isSaving?: boolean;
  isConfirming?: boolean;
  canConfirm?: boolean;
  completionPercentage?: number;
  pendingItems?: string[];
  isEditing?: boolean;
  onToggleEdit?: () => void;
  hasSavedProfile?: boolean;
  hideSkip?: boolean;
}) {
  return (
    <header className="sticky top-16 z-20 w-full border-b border-slate-200 bg-white/95 backdrop-blur py-3 transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 space-y-2.5">
        {/* Top Row: Title + Actions */}
        <div className="flex items-center justify-between">
          {/* Título */}
          <h1 className="text-lg font-bold text-[#0E3E66] md:text-xl">
            Configuración de Perfil
          </h1>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {hasSavedProfile ? (
              isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={onToggleEdit}
                    className="text-slate-600 hover:text-slate-800 text-sm font-semibold"
                    disabled={isSaving || isConfirming}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={onSave}
                    disabled={isSaving || isConfirming}
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold animate-pulse"
                  >
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onToggleEdit}
                  disabled={isSaving || isConfirming}
                  className="bg-[#0E3E66] text-white hover:bg-[#0E3E66]/90 text-sm font-semibold shadow-md"
                >
                  Editar
                </Button>
              )
            ) : (
              <>
                {!hideSkip && (
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="text-slate-600 hover:text-slate-800 text-sm font-semibold"
                    disabled={isSaving || isConfirming}
                  >
                    Omitir
                  </Button>
                )}
                <Button
                  onClick={onSave}
                  disabled={isSaving || isConfirming}
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  {isSaving ? "Guardando..." : "Guardar borrador"}
                </Button>
              </>
            )}

            {onConfirm && (
              <Button
                onClick={onConfirm}
                disabled={isSaving || isConfirming || !canConfirm}
                className="bg-gradient-to-r from-[#7447D7] to-[#D43EE6] text-white hover:opacity-90 disabled:opacity-50 text-sm font-semibold shadow-md shadow-purple-200/50"
              >
                {isConfirming ? "Confirmando..." : "Confirmar Perfil"}
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Row: Progress + Pending Fields */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-600">Progreso:</span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 md:w-40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0E3E66] via-[#643781] to-[#B9309C] transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="font-bold text-[#0E3E66]">{completionPercentage}%</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {pendingItems.length > 0 ? (
              <>
                <span className="text-slate-500 font-medium">Falta completar:</span>
                {pendingItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 font-medium text-red-700 ring-1 ring-inset ring-red-600/10 transition-all duration-300"
                  >
                    {item}
                  </span>
                ))}
              </>
            ) : (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10 transition-all duration-300">
                🎉 ¡Todo listo para confirmar!
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}