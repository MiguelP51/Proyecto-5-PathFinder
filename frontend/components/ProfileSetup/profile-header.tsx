"use client";

import { Button } from "@/components/ui/button";

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
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#0E3E66]"
                    >
                        <circle
                            cx="20"
                            cy="20"
                            r="18"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M20 8V20L28 28"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="20" cy="20" r="3" fill="currentColor" />
                    </svg>
                    <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#0E3E66]">
              PATH
            </span>
                        <span className="text-lg font-bold tracking-tight text-[#0E3E66]">
              FINDER
            </span>
                    </div>
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
