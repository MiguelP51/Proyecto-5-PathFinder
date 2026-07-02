"use client";

import { Award, Sparkles, Trophy, Zap } from "lucide-react";

import { MiProgreso } from "@/lib/progreso/types";

interface MiProgresoClientProps {
    progreso: MiProgreso;
}

export function MiProgresoClient({ progreso }: MiProgresoClientProps) {
    const {
        xpTotal,
        nivel,
        xpSiguienteNivel,
        xpFaltanteSiguienteNivel,
        esNuevo,
        insignias,
    } = progreso;

    const porcentajeNivel = xpSiguienteNivel > 0
        ? Math.min(100, Math.round((xpTotal / xpSiguienteNivel) * 100))
        : 0;

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-6">
                <p className="text-sm font-semibold text-[#7447D7]">Mi Progreso</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950">
                    Tu avance en PathFinder
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Nivel, experiencia e insignias obtenidas en toda la plataforma.
                </p>
            </div>

            {/* Tarjeta de nivel + XP */}
            <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#7447D7] to-[#c850c0] p-6 text-white shadow-sm sm:p-8">
                <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-medium text-purple-100">
                            Nivel actual
                        </p>
                        <p className="text-5xl font-black">
                            {nivel}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="rounded-2xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
                            <Zap className="mx-auto mb-1 h-5 w-5 text-yellow-300" />
                            <p className="text-lg font-bold">{xpTotal}</p>
                            <p className="text-xs text-purple-100">XP total</p>
                        </div>

                        <div className="rounded-2xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
                            <Trophy className="mx-auto mb-1 h-5 w-5 text-yellow-300" />
                            <p className="text-lg font-bold">{insignias.length}</p>
                            <p className="text-xs text-purple-100">Insignias</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-purple-100">
                        <span>Progreso al nivel {nivel + 1}</span>
                        <span>{xpTotal} / {xpSiguienteNivel} XP</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-white/20">
                        <div
                            className="h-full rounded-full bg-white transition-all"
                            style={{ width: `${porcentajeNivel}%` }}
                        />
                    </div>

                    <p className="mt-2 text-xs text-purple-100">
                        Te faltan {xpFaltanteSiguienteNivel} XP para subir de nivel.
                    </p>
                </div>
            </div>

            {/* Estado vacío para estudiantes nuevos */}
            {esNuevo && (
                <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50 p-8 text-center">
                    <Sparkles className="h-8 w-8 text-[#7447D7]" />
                    <p className="text-base font-bold text-slate-900">
                        Todavía no tienes experiencia ni insignias
                    </p>
                    <p className="text-sm text-slate-500">
                        Completa tu primera misión práctica o ruta de aprendizaje
                        para empezar a ganar XP y desbloquear insignias.
                    </p>
                </div>
            )}

            {/* Vitrina de insignias */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#7447D7]" />
                    <h2 className="font-bold text-slate-900">Insignias obtenidas</h2>
                </div>

                {insignias.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-400">
                        Aún no has obtenido insignias. ¡Sigue avanzando para
                        desbloquear la primera!
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {insignias.map((insignia) => (
                            <div
                                key={insignia.idInsignia}
                                className="flex flex-col items-center rounded-2xl border border-slate-100 p-4 text-center"
                            >
                                <div
                                    className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                                        insignia.colorFondo ?? "bg-purple-100"
                                    }`}
                                >
                                    {insignia.emoji ?? "🏆"}
                                </div>

                                <p className="text-sm font-bold text-slate-900">
                                    {insignia.nombre}
                                </p>

                                {insignia.descripcion && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        {insignia.descripcion}
                                    </p>
                                )}

                                {insignia.fechaObtenida && (
                                    <p className="mt-2 text-xs font-medium text-emerald-600">
                                        ✓ Obtenida {insignia.fechaObtenida}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
