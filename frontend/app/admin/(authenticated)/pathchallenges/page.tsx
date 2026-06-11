"use client";

import {
  Target,
  Trophy,
  CheckCircle,
  Star,
  Plus,
  Edit2,
  Power,
  Trash2
} from "lucide-react";

import { useEffect, useState } from "react";
import { pathChallengeService } from "@/lib/pathchallenge/service";
import { PathChallengeResponseDTO } from "@/lib/pathchallenge/types";

export default function PathChallengesPage() {
  const [misiones, setMisiones] = useState<PathChallengeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMisiones();
  }, []);

  const fetchMisiones = async () => {
    try {
      setLoading(true);
      const data = await pathChallengeService.getAll();
      setMisiones(data);
    } catch (error) {
      console.error("Error fetching path challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalMisiones = misiones.length;
  const publicadas = misiones.filter(m => m.estado === 'Publicada').length;
  const totalCompletadas = misiones.reduce((acc, m) => acc + m.completadas, 0);
  const xpOtorgado = misiones.reduce((acc, m) => acc + (m.xp * m.completadas), 0);

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Gestión de PathChallenges
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Crea y configura misiones para estudiantes
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/admin/pathchallenges/new'}
          className="flex items-center gap-2 self-start rounded-xl bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 shadow-md shadow-pink-200 transition text-sm font-bold">
          <Plus className="h-4 w-4" />
          <span>Nueva Misión</span>
        </button>
      </section>

      {/* Tarjetas de Estadísticas */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{totalMisiones}</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Total Misiones</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{publicadas}</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Publicadas</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{totalCompletadas.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Completadas (Total)</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{xpOtorgado.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">XP Otorgado</span>
          </div>
        </article>
      </section>

      {/* Tabla de Misiones */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col gap-1">
          <h2 className="text-base font-bold text-slate-800">Misiones Disponibles</h2>
          <p className="text-xs text-slate-500">Gestiona retos prácticos para estudiantes</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50/50 border-b border-slate-200/60 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Subárea</th>
                <th className="px-6 py-4">Dificultad</th>
                <th className="px-6 py-4">Tareas</th>
                <th className="px-6 py-4">XP</th>
                <th className="px-6 py-4">Completadas</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">Cargando misiones...</td>
                </tr>
              ) : misiones.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">No hay misiones configuradas.</td>
                </tr>
              ) : (
                misiones.map((mision) => (
                  <tr key={mision.idPathChallenge} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{mision.titulo}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {mision.tags.map((tag, idx) => (
                          <span key={idx} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{mision.subareaNombre}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        mision.dificultad === 'Facil' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        mision.dificultad === 'Media' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                        'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {mision.dificultad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs text-center">{mision.tareasCount}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        {mision.xp}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="flex items-center gap-1.5 text-xs">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        {mision.completadas}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        mision.estado === 'Publicada' 
                          ? 'bg-[#0E3E66] text-white shadow-sm' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {mision.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm("¿Estás seguro de eliminar esta misión?")) {
                              await pathChallengeService.delete(mision.idPathChallenge);
                              fetchMisiones();
                            }
                          }}
                          className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
