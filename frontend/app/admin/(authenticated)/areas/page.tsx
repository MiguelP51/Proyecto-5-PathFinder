"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { Search, Plus, Edit2, Power } from "lucide-react";
import AreaFormModal from "@/components/admin/AreaFormModal";

interface Area {
  idArea: string;
  nombre: string;
  emoji: string;
  activo: boolean;
}

export default function AreasPage() {
  const { data: session, status } = useSession();

  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Area | null>(null);

  const cargarAreas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch<Area[]>("/api/admin/areas", {}, session?.backendJwt);
      setAreas(data || []);
    } catch (err) {
      console.error("Error al cargar áreas:", err);
      setError(err instanceof Error ? err.message : "No se pudieron recuperar las áreas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      cargarAreas();
    }
  }, [status, session]);

  const handleCambiarEstado = async (item: Area) => {
    const nuevoEstado = !item.activo;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (
      !confirm(
        `¿Seguro que deseas ${accion} esta área? Esto afectará en cascada a sus subáreas asociadas.`
      )
    )
      return;

    try {
      await apiFetch(
        `/api/admin/areas/${item.idArea}/estado?activo=${nuevoEstado}`,
        { method: "PATCH" },
        session?.backendJwt
      );
      cargarAreas();
    } catch (err) {
      alert(`Error al ${accion}`);
    }
  };

  const filteredAreas = areas.filter((a) =>
    a.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Gestión de Áreas
          </h1>
          <p className="mt-2 text-slate-500 text-sm md:text-base">
            Administra las áreas principales de especialización profesional.
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
          <span>Nueva Área</span>
        </button>
      </section>

      {/* Controles de Búsqueda */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
          />
        </div>
      </section>

      {/* Tabla de Areas */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-700">
              <thead className="bg-slate-50/50 border-b border-slate-200/60 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Emoji</th>
                  <th className="px-6 py-4">Código / ID</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAreas.map((item) => (
                  <tr key={item.idArea} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4 text-2xl">{item.emoji || "📁"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.idArea}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{item.nombre}</p>
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
                {filteredAreas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No se encontraron áreas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen && (
        <AreaFormModal
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            cargarAreas();
          }}
          editingItem={editingItem}
        />
      )}
    </div>
  );
}
