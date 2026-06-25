"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import {
  Search,
  Plus,
  Edit2,
  Power,
  Upload,
  Download,
  FolderOpen,
} from "lucide-react";
import SkillPathFormModal from "@/components/admin/SkillPathFormModal";
import SkillPathBulkUploadModal from "@/components/admin/SkillPathBulkUploadModal";
import QuickAssignSubareaModal from "@/components/admin/QuickAssignSubareaModal";

export interface SkillPath {
  idSkillPath: number;
  titulo: string;
  plataforma: string;
  descripcion: string;
  urlExterno: string;
  progreso: number;
  estado: string;
  xp: number;
  dificultad: string;
  duracionLabel: string;
  areaNombre: string;
  subareaNombre: string;
  esRecomendado: boolean;
  activo: boolean;
  usuarioCorreo: string | null;
  usuarioNombre: string | null;
  subareaId?: number | string;
  areaId?: number | string;
  estadoPublicacion?: string;
}

export default function SkillPathsPage() {
  const { data: session, status } = useSession();

  const [skillpaths, setSkillpaths] = useState<SkillPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoPublicacionFilter, setEstadoPublicacionFilter] = useState<string>("TODOS");

  const [areas, setAreas] = useState<any[]>([]);
  const [subareas, setSubareas] = useState<any[]>([]);
  const [areaFilter, setAreaFilter] = useState<string>("TODAS");
  const [subareaFilter, setSubareaFilter] = useState<string>("TODAS");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkillPath | null>(null);
  const [assigningItem, setAssigningItem] = useState<SkillPath | null>(null);

  const cargarSkillPaths = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch<SkillPath[]>(`/api/admin/manage-skillpaths?tipo=GLOBAL`, {}, session?.backendJwt);
      setSkillpaths(data || []);
    } catch (err) {
      console.error("Error al cargar skillpaths:", err);
      setError(err instanceof Error ? err.message : "No se pudieron recuperar los skillpaths");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      cargarSkillPaths();
    }
  }, [status, session]);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const areasData = await apiFetch<any[]>('/api/admin/areas?soloActivos=true', {}, session?.backendJwt);
        setAreas(areasData || []);
        const subareasData = await apiFetch<any[]>('/api/admin/subareas?soloActivos=true', {}, session?.backendJwt);
        setSubareas(subareasData || []);
      } catch (err) {
        console.error("Error al cargar catálogos de filtros:", err);
      }
    };
    if (status === "authenticated" && session?.backendJwt) {
      cargarCatalogos();
    }
  }, [status, session]);

  const handleCambiarEstado = async (item: SkillPath) => {
    const nuevoEstado = !item.activo;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (!confirm(`Seguro que deseas ${accion} este SkillPath?`)) return;

    try {
      await apiFetch(
        `/api/admin/manage-skillpaths/${item.idSkillPath}/estado`,
        {
          method: "PATCH",
          body: JSON.stringify({ activo: nuevoEstado }),
        },
        session?.backendJwt,
      );
      cargarSkillPaths();
    } catch (err) {
      alert(`Error al ${accion}`);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = [
      "titulo,plataforma,subareaNombre,dificultad,duracionLabel,urlExterno,descripcion",
      "Curso de Excel,Coursera,Analisis de Datos,PRINCIPIANTE,6 horas,https://www.coursera.org/,Curso introductorio",
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "skillpaths-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredSkillpaths = skillpaths.filter(sp => {
    const matchesSearch = sp.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sp.plataforma?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoPublicacionFilter === "TODOS" || sp.estadoPublicacion === estadoPublicacionFilter;
    
    let matchesArea = true;
    if (areaFilter === "SIN_ASIGNAR") {
      matchesArea = !sp.areaId;
    } else if (areaFilter !== "TODAS") {
      matchesArea = String(sp.areaId) === String(areaFilter);
    }

    let matchesSubarea = true;
    if (areaFilter !== "SIN_ASIGNAR" && subareaFilter !== "TODAS") {
      matchesSubarea = String(sp.subareaId) === String(subareaFilter);
    }

    return matchesSearch && matchesEstado && matchesArea && matchesSubarea;
  });

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Gestión de SkillPaths
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Administra plantillas globales de aprendizaje
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 self-start rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 shadow-sm transition text-sm font-bold"
          >
            <Download className="h-4 w-4" />
            <span>Descargar Template</span>
          </button>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-2 self-start rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 shadow-sm transition text-sm font-bold"
          >
            <Upload className="h-4 w-4" />
            <span>Carga Masiva</span>
          </button>
          <button
            onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 self-start rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 shadow-md shadow-purple-200 transition text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo SkillPath</span>
          </button>
        </div>
      </section>

      {/* Controles de Búsqueda y Filtrado */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
            />
          </div>

          {/* Filtro de Área */}
          <div className="w-full md:w-56">
            <select
              value={areaFilter}
              onChange={(e) => {
                const val = e.target.value;
                setAreaFilter(val);
                setSubareaFilter("TODAS");
              }}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
            >
              <option value="TODAS">Todas las Áreas</option>
              <option value="SIN_ASIGNAR">Sin Área Asignada</option>
              {areas.map((a) => (
                <option key={a.idArea} value={a.idArea}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Subárea */}
          <div className="w-full md:w-56">
            <select
              value={subareaFilter}
              onChange={(e) => setSubareaFilter(e.target.value)}
              disabled={areaFilter === "SIN_ASIGNAR"}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="TODAS">Todas las Subáreas</option>
              {subareas
                .filter((sa) => areaFilter === "TODAS" || String(sa.areaId) === String(areaFilter))
                .map((sa) => (
                  <option key={sa.idSubarea} value={sa.idSubarea}>
                    {sa.nombre}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Tabs de Estado de Publicación y Conteo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-150 w-fit">
            {[
              { value: "TODOS", label: "Todos" },
              { value: "BORRADOR", label: "Borradores" },
              { value: "ACTIVA", label: "Activos" },
              { value: "INACTIVA", label: "Inactivos" }
            ].map((statusTab) => (
              <button
                key={statusTab.value}
                onClick={() => setEstadoPublicacionFilter(statusTab.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  estadoPublicacionFilter === statusTab.value
                    ? "bg-white text-purple-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {statusTab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Mostrando {filteredSkillpaths.length} {filteredSkillpaths.length === 1 ? "SkillPath" : "SkillPaths"}
          </span>
        </div>
      </section>

      {/* Tabla de Recursos */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-700">
              <thead className="bg-slate-50/50 border-b border-slate-200/60 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Título / Descripción</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Nivel</th>
                  <th className="px-6 py-4">Subárea Asociada</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSkillpaths.map((item) => (
                  <tr key={item.idSkillPath} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        {item.titulo}
                      </p>
                      {item.descripcion && (
                        <p className="text-xs text-slate-400 font-normal italic mt-0.5 max-w-sm truncate" title={item.descripcion}>
                          {item.descripcion}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.plataforma}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${item.dificultad === 'Principiante' ? 'bg-blue-50 text-blue-600' :
                          item.dificultad === 'Intermedio' ? 'bg-purple-50 text-purple-600' :
                            'bg-orange-50 text-orange-600'
                        }`}>
                        {item.dificultad || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.subareaNombre ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{item.subareaNombre}</span>
                          <span className="text-[10px] text-slate-400">{item.areaNombre}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          Sin Asignar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${item.activo
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        {item.estadoPublicacion && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            item.estadoPublicacion === 'ACTIVA' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            item.estadoPublicacion === 'BORRADOR' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.estadoPublicacion}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button
                          onClick={() => { setEditingItem(item); setIsFormOpen(true); }}
                          className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setAssigningItem(item)}
                          className="p-1.5 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Asignar Subárea">
                          <FolderOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(item)}
                          className={`p-1.5 rounded-lg transition ${item.activo
                              ? "hover:text-red-600 hover:bg-red-50"
                              : "hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                          title={item.activo ? "Desactivar" : "Activar"}>
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSkillpaths.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No se encontraron resultados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen && (
        <SkillPathFormModal
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); cargarSkillPaths(); }}
          editingItem={editingItem}
        />
      )}

      {isBulkOpen && (
        <SkillPathBulkUploadModal
          onClose={() => setIsBulkOpen(false)}
          onSuccess={() => { setIsBulkOpen(false); cargarSkillPaths(); }}
        />
      )}

      {assigningItem && (
        <QuickAssignSubareaModal
          item={assigningItem}
          onClose={() => setAssigningItem(null)}
          onSuccess={() => { setAssigningItem(null); cargarSkillPaths(); }}
        />
      )}
    </div>
  );
}
