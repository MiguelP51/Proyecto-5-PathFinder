"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { Search, Plus, Edit2, Power } from "lucide-react";
import SubAreaFormModal from "@/components/admin/SubAreaFormModal";

interface SubArea {
  idSubarea: number;
  areaId: string;
  areaNombre: string;
  areaEmoji: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  nivel: string;
  cantidadSkillPaths: number;
  cantidadPathChallenges: number;
  plataformasSkillPath: string;
  activo: boolean;
  slug: string;
}

export default function SubAreasPage() {
  const { data: session, status } = useSession();

  const [subareas, setSubareas] = useState<SubArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [areas, setAreas] = useState<any[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubArea | null>(null);

  const cargarSubAreas = async () => {
    try {
      setLoading(true);
      setError("");
      const url = selectedAreaId 
        ? `/api/admin/subareas?areaId=${selectedAreaId}` 
        : "/api/admin/subareas";
      const data = await apiFetch<SubArea[]>(url, {}, session?.backendJwt);
      setSubareas(data || []);
    } catch (err) {
      console.error("Error al cargar subáreas:", err);
      setError(err instanceof Error ? err.message : "No se pudieron recuperar las subáreas");
    } finally {
      setLoading(false);
    }
  };

  const cargarAreas = async () => {
    try {
      const data = await apiFetch<any[]>("/api/admin/areas", {}, session?.backendJwt);
      setAreas(data || []);
    } catch (err) {
      console.error("Error al cargar áreas para filtro:", err);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      cargarAreas();
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      cargarSubAreas();
    }
  }, [status, session, selectedAreaId]);

  const handleCambiarEstado = async (item: SubArea) => {
    const nuevoEstado = !item.activo;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (!confirm(`¿Seguro que deseas ${accion} esta subárea?`)) return;

    try {
      await apiFetch(
        `/api/admin/subareas/${item.idSubarea}/estado?activo=${nuevoEstado}`,
        { method: "PATCH" },
        session?.backendJwt
      );
      cargarSubAreas();
    } catch (err) {
      alert(`Error al ${accion}`);
    }
  };

  const filteredSubareas = subareas.filter((sa) =>
    sa.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Gestión de Subáreas
          </h1>
          <p className="mt-2 text-slate-500 text-sm md:text-base">
            Administra las subáreas de especialización y asócialas a sus áreas correspondientes.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 self-start rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 shadow-md shadow-purple-200 transition text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Subárea</span>
        </button>
      </section>

      {/* Controles de Búsqueda y Filtros */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de subárea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Filtrar por Área:</span>
          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            className="h-11 border rounded-xl px-3 text-sm outline-none focus:border-purple-500 bg-slate-50/50 text-slate-700 min-w-[200px]"
          >
            <option value="">Todas las Áreas</option>
            {areas.map((a) => (
              <option key={a.idArea} value={a.idArea}>
                {a.emoji} {a.nombre}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Tabla de Subareas */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-700">
              <thead className="bg-slate-50/50 border-b border-slate-200/60 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Emoji</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Área Asociada</th>
                  <th className="px-6 py-4">Nivel</th>
                  <th className="px-6 py-4">SkillPaths / Challenges</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSubareas.map((item) => (
                  <tr key={item.idSubarea} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4 text-2xl">{item.emoji || "🔍"}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{item.nombre}</p>
                      <p className="text-xs text-slate-400 font-mono">slug: {item.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                        <span>{item.areaEmoji}</span>
                        <span>{item.areaNombre}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.nivel || "Principiante"}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      📚 {item.cantidadSkillPaths} SkillPaths / 🎯 {item.cantidadPathChallenges} Challenges
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          item.activo
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {item.activo ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(item)}
                          className={`p-1.5 rounded-lg transition ${
                            item.activo
                              ? "hover:text-red-600 hover:bg-red-50"
                              : "hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={item.activo ? "Desactivar" : "Activar"}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSubareas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No se encontraron subáreas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen && (
        <SubAreaFormModal
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            cargarSubAreas();
          }}
          editingItem={editingItem}
        />
      )}
    </div>
  );
}
