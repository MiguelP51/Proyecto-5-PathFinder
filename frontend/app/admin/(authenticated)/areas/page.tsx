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
  Save, 
  Check, 
  X, 
  ChevronRight, 
  Loader2, 
  Sparkles, 
  FileSpreadsheet, 
  AlertCircle, 
  Info,
  Layers,
  ArrowRightLeft
} from "lucide-react";
import AreaFormModal from "@/components/admin/AreaFormModal";
import SubAreaFormModal from "@/components/admin/SubAreaFormModal";

interface Area {
  idArea: string;
  nombre: string;
  emoji: string;
  descripcion?: string;
  imagenUrl?: string;
  activo: boolean;
}

interface SubArea {
  idSubarea: number;
  areaId: string;
  areaNombre: string;
  areaEmoji: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  objetivos: string;
  habilidadesRelacionadas: string;
  nivel: string;
  cantidadSkillPaths: number;
  cantidadPathChallenges: number;
  plataformasSkillPath: string;
  activo: boolean;
  slug: string;
}

export default function AreasPage() {
  const { data: session, status } = useSession();

  // Estados generales
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [subareas, setSubareas] = useState<SubArea[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingSubareas, setLoadingSubareas] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales unitarios
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isSubAreaModalOpen, setIsSubAreaModalOpen] = useState(false);
  const [editingSubArea, setEditingSubArea] = useState<SubArea | null>(null);

  // Modales importación masiva
  const [isImportAreasOpen, setIsImportAreasOpen] = useState(false);
  const [isImportSubAreasOpen, setIsImportSubAreasOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [defaultAreaId, setDefaultAreaId] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  // Modo edición rápida en lote (Batch)
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchList, setBatchList] = useState<any[]>([]);
  const [savingBatch, setSavingBatch] = useState(false);

  // Cargar áreas
  const cargarAreas = async (selectFirst = false) => {
    try {
      setLoadingAreas(true);
      const data = await apiFetch<Area[]>("/api/admin/areas", {}, session?.backendJwt);
      setAreas(data || []);
      
      // Auto-seleccionar la primera área si no hay ninguna seleccionada
      if (data && data.length > 0) {
        if (selectFirst || !selectedArea) {
          setSelectedArea(data[0]);
        } else {
          // Actualizar el estado de la seleccionada actualmente por si cambió
          const actualizada = data.find(a => a.idArea === selectedArea.idArea);
          if (actualizada) setSelectedArea(actualizada);
        }
      } else {
        setSelectedArea(null);
      }
    } catch (err) {
      console.error("Error al cargar áreas:", err);
    } finally {
      setLoadingAreas(false);
    }
  };

  // Cargar subáreas del área seleccionada
  const cargarSubareas = async (areaId: string) => {
    try {
      setLoadingSubareas(true);
      const data = await apiFetch<SubArea[]>(`/api/admin/subareas?areaId=${areaId}`, {}, session?.backendJwt);
      setSubareas(data || []);
      // Si estamos en modo lote, reiniciamos la lista de edición
      if (isBatchMode) {
        setBatchList(data ? data.map(sa => ({ ...sa })) : []);
      }
    } catch (err) {
      console.error("Error al cargar subáreas:", err);
    } finally {
      setLoadingSubareas(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      cargarAreas(true);
    }
  }, [status, session]);

  useEffect(() => {
    if (selectedArea && session?.backendJwt) {
      cargarSubareas(selectedArea.idArea);
    } else {
      setSubareas([]);
    }
  }, [selectedArea]);

  // Cambiar estado de Área
  const handleCambiarEstadoArea = async (item: Area) => {
    const nuevoEstado = !item.activo;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (!confirm(`¿Seguro que deseas ${accion} esta área? Esto desactivará sus subáreas asociadas en cascada.`)) {
      return;
    }

    try {
      await apiFetch(
        `/api/admin/areas/${item.idArea}/estado?activo=${nuevoEstado}`,
        { method: "PATCH" },
        session?.backendJwt
      );
      await cargarAreas();
    } catch (err) {
      alert(`Error al cambiar el estado del área: ${err instanceof Error ? err.message : "Intente nuevamente"}`);
    }
  };

  // Cambiar estado de Subárea
  const handleCambiarEstadoSubArea = async (item: SubArea) => {
    const nuevoEstado = !item.activo;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (nuevoEstado && selectedArea && !selectedArea.activo) {
      alert("No se puede activar una subárea si su área principal está inactiva.");
      return;
    }

    if (!confirm(`¿Seguro que deseas ${accion} esta subárea?`)) return;

    try {
      await apiFetch(
        `/api/admin/subareas/${item.idSubarea}/estado?activo=${nuevoEstado}`,
        { method: "PATCH" },
        session?.backendJwt
      );
      if (selectedArea) {
        cargarSubareas(selectedArea.idArea);
      }
    } catch (err) {
      alert(`Error al cambiar el estado de la subárea: ${err instanceof Error ? err.message : "Intente nuevamente"}`);
    }
  };

  // Importar Excel (Áreas o Subáreas)
  const handleImport = async (e: React.FormEvent, tipo: "areas" | "subareas") => {
    e.preventDefault();
    if (!importFile) return;

    setImportLoading(true);
    setImportError("");
    setImportSuccess("");

    const formData = new FormData();
    formData.append("file", importFile);

    let url = `/api/admin/${tipo}/import`;
    if (tipo === "subareas" && defaultAreaId) {
      url += `?defaultAreaId=${defaultAreaId}`;
    }

    try {
      await apiFetch(url, {
        method: "POST",
        body: formData
      }, session?.backendJwt);

      setImportSuccess("Datos importados con éxito.");
      setImportFile(null);
      
      // Cerrar y recargar
      setTimeout(() => {
        if (tipo === "areas") {
          setIsImportAreasOpen(false);
          cargarAreas(true);
        } else {
          setIsImportSubAreasOpen(false);
          if (selectedArea) cargarSubareas(selectedArea.idArea);
        }
        setImportSuccess("");
      }, 1500);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Error al procesar el archivo. Verifique el formato e intente nuevamente.");
    } finally {
      setImportLoading(false);
    }
  };

  // Modo lote: activar/desactivar
  const handleToggleBatchMode = () => {
    if (!isBatchMode) {
      // Activar: rellenar la lista editable
      setBatchList(subareas.map(sa => ({ ...sa })));
      setIsBatchMode(true);
    } else {
      // Cancelar
      setIsBatchMode(false);
      setBatchList([]);
    }
  };

  // Agregar fila vacía de subárea en modo lote
  const handleAddBatchRow = () => {
    if (!selectedArea) return;
    const newRow = {
      idSubarea: null, // indica creación
      areaId: selectedArea.idArea,
      areaNombre: selectedArea.nombre,
      nombre: "",
      emoji: "📁",
      descripcion: "",
      objetivos: "",
      habilidadesRelacionadas: "",
      nivel: "Principiante",
      plataformasSkillPath: "",
      activo: true,
      slug: ""
    };
    setBatchList(prev => [...prev, newRow]);
  };

  // Actualizar un campo de una fila en el batch
  const handleUpdateBatchField = (index: number, field: string, value: any) => {
    setBatchList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Eliminar fila agregada (o marcar para desactivación si ya existe)
  const handleRemoveBatchRow = (index: number) => {
    setBatchList(prev => prev.filter((_, i) => i !== index));
  };

  // Guardar cambios en lote
  const handleSaveBatch = async () => {
    // Validaciones básicas
    const invalid = batchList.some(item => !item.nombre || !item.nombre.trim());
    if (invalid) {
      alert("Todas las subáreas deben tener un nombre.");
      return;
    }

    setSavingBatch(true);
    try {
      await apiFetch("/api/admin/subareas/batch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchList)
      }, session?.backendJwt);

      alert("Cambios en lote guardados correctamente.");
      setIsBatchMode(false);
      if (selectedArea) {
        cargarSubareas(selectedArea.idArea);
      }
    } catch (err) {
      alert("Error al guardar cambios masivos: " + (err instanceof Error ? err.message : "Error desconocido"));
    } finally {
      setSavingBatch(false);
    }
  };

  // Filtrado de áreas por búsqueda
  const filteredAreas = areas.filter(a =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/40 p-4 md:p-8 space-y-8">
      {/* Encabezado y Acciones de Carga Masiva */}
      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0E3E66] md:text-4xl">
            Gestión Unificada de Áreas y Subáreas
          </h1>
          <p className="mt-2 text-slate-500 text-sm md:text-base">
            Administra las áreas de especialización y sus subáreas asociadas desde una única pantalla interactiva.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setEditingArea(null);
              setIsAreaModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 shadow-sm transition text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Área</span>
          </button>

          <button
            onClick={() => setIsImportAreasOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 shadow-xs transition text-sm font-bold"
          >
            <Upload className="h-4 w-4 text-purple-600" />
            <span>Excel Áreas</span>
          </button>

          <button
            onClick={() => setIsImportSubAreasOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 shadow-xs transition text-sm font-bold"
          >
            <Upload className="h-4 w-4 text-purple-600" />
            <span>Excel Subáreas</span>
          </button>
        </div>
      </section>

      {/* Layout Maestro-Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* PANEL MAESTRO: Listado de Áreas (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#0E3E66]" />
              <span>Áreas Académicas</span>
            </h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 pl-9 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-[65vh] overflow-y-auto pr-1">
            {loadingAreas ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span>Cargando áreas...</span>
              </div>
            ) : filteredAreas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-sm">
                No se encontraron áreas
              </div>
            ) : (
              filteredAreas.map((area) => {
                const isSelected = selectedArea?.idArea === area.idArea;
                return (
                  <div
                    key={area.idArea}
                    onClick={() => {
                      if (!isBatchMode || confirm("Tienes cambios sin guardar en lote. ¿Deseas descartarlos para cambiar de área?")) {
                        setIsBatchMode(false);
                        setSelectedArea(area);
                      }
                    }}
                    className={`group cursor-pointer rounded-2xl p-4 border transition flex items-center justify-between shadow-xs ${
                      isSelected
                        ? "bg-purple-50/60 border-purple-200 text-purple-900"
                        : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                        {area.imagenUrl ? (
                          <img
                            src={area.imagenUrl.startsWith("areas/") ? `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/api/areas/${area.idArea}/imagen` : area.imagenUrl}
                            alt={area.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{area.emoji || "📁"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate group-hover:text-purple-700 transition">
                          {area.nombre}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                          ID: {area.idArea}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          area.activo
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {area.activo ? "Activa" : "Inactiva"}
                      </span>
                      <ChevronRight className={`h-4 w-4 transition ${isSelected ? "text-purple-500 translate-x-1" : "text-slate-400 group-hover:translate-x-0.5"}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL DETALLE: Ficha del Área y Tabla de Subáreas (3/5) */}
        <div className="lg:col-span-3">
          {selectedArea ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden space-y-6">
              
              {/* Encabezado del Detalle (Ficha de Área) */}
              <div className="p-6 bg-slate-50/50 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                    {selectedArea.imagenUrl ? (
                      <img
                        src={selectedArea.imagenUrl.startsWith("areas/") ? `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/api/areas/${selectedArea.idArea}/imagen` : selectedArea.imagenUrl}
                        alt={selectedArea.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{selectedArea.emoji || "📁"}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-800">{selectedArea.nombre}</h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          selectedArea.activo
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {selectedArea.activo ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">Slug/Código: {selectedArea.idArea}</p>
                    {selectedArea.descripcion && (
                      <p className="text-xs text-slate-500 mt-2 max-w-xl">{selectedArea.descripcion}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => {
                      setEditingArea(selectedArea);
                      setIsAreaModalOpen(true);
                    }}
                    className="p-2 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 bg-white rounded-xl transition shadow-2xs"
                    title="Editar Área"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleCambiarEstadoArea(selectedArea)}
                    className={`p-2 border rounded-xl transition shadow-2xs ${
                      selectedArea.activo
                        ? "hover:text-rose-600 hover:bg-rose-50 border-slate-200 bg-white"
                        : "hover:text-emerald-600 hover:bg-emerald-50 border-emerald-200 bg-emerald-50/30"
                    }`}
                    title={selectedArea.activo ? "Desactivar Área" : "Activar Área"}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Listado y CRUD de Subáreas */}
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Subáreas de Especialización</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Define las competencias y temas clave.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleBatchMode}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border shadow-2xs ${
                        isBatchMode
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                          : "bg-white hover:bg-slate-50 text-purple-600 border-purple-200"
                      }`}
                    >
                      <Sparkles className="h-4.5 w-4.5" />
                      <span>{isBatchMode ? "Salir de Edición Lote" : "Edición en Lote"}</span>
                    </button>

                    {!isBatchMode ? (
                      <button
                        onClick={() => {
                          setEditingSubArea(null);
                          setIsSubAreaModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-[#0E3E66] hover:bg-[#092a46] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Nueva Subárea</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleAddBatchRow}
                        className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold border border-purple-200 transition"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Añadir Fila</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtabla de Subáreas */}
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                  {loadingSubareas ? (
                    <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                      <span>Cargando subáreas...</span>
                    </div>
                  ) : subareas.length === 0 && batchList.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50/20">
                      No hay subáreas registradas para este área.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm text-slate-700">
                        <thead className="bg-slate-50/50 border-b border-slate-200/60 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Emoji</th>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Nivel</th>
                            <th className="px-4 py-3">Mover Área</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          
                          {/* MODO ESTÁNDAR */}
                          {!isBatchMode && subareas.map((item) => (
                            <tr key={item.idSubarea} className="hover:bg-slate-50/30 transition">
                              <td className="px-4 py-3 text-xl">{item.emoji || "📁"}</td>
                              <td className="px-4 py-3">
                                <p className="font-bold text-slate-800">{item.nombre}</p>
                                <p className="text-[10px] text-slate-400 font-mono">slug: {item.slug}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {item.nivel || "Principiante"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-400">
                                📚 {item.cantidadSkillPaths} Paths / 🎯 {item.cantidadPathChallenges} Rets
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                                    item.activo
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}
                                >
                                  {item.activo ? "Activa" : "Inactiva"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5 text-slate-400">
                                  <button
                                    onClick={() => {
                                      setEditingSubArea(item);
                                      setIsSubAreaModalOpen(true);
                                    }}
                                    className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Editar Subárea"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCambiarEstadoSubArea(item)}
                                    className={`p-1.5 rounded-lg transition ${
                                      item.activo
                                        ? "hover:text-rose-600 hover:bg-rose-50"
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

                          {/* MODO LOTE (BATCH) */}
                          {isBatchMode && batchList.map((item, index) => (
                            <tr key={index} className="bg-purple-50/10 hover:bg-purple-50/20 transition">
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={item.emoji || ""}
                                  onChange={(e) => handleUpdateBatchField(index, "emoji", e.target.value)}
                                  className="w-12 h-9 border rounded-lg text-center text-lg outline-none focus:border-purple-500 bg-white"
                                  placeholder="📁"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={item.nombre || ""}
                                  onChange={(e) => handleUpdateBatchField(index, "nombre", e.target.value)}
                                  className="w-full h-9 border rounded-lg px-2 text-xs outline-none focus:border-purple-500 bg-white text-slate-800 font-bold"
                                  placeholder="Ej. Reclutamiento"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  value={item.nivel || "Principiante"}
                                  onChange={(e) => handleUpdateBatchField(index, "nivel", e.target.value)}
                                  className="h-9 border rounded-lg px-2 text-xs outline-none focus:border-purple-500 bg-white text-slate-700"
                                >
                                  <option value="Principiante">Principiante</option>
                                  <option value="Intermedio">Intermedio</option>
                                  <option value="Avanzado">Avanzado</option>
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  value={item.areaId || ""}
                                  onChange={(e) => handleUpdateBatchField(index, "areaId", e.target.value)}
                                  className="h-9 border rounded-lg px-2 text-xs outline-none focus:border-purple-500 bg-white text-slate-600 max-w-[140px]"
                                >
                                  {areas.map(a => (
                                    <option key={a.idArea} value={a.idArea}>
                                      {a.nombre}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  value={item.activo ? "true" : "false"}
                                  onChange={(e) => handleUpdateBatchField(index, "activo", e.target.value === "true")}
                                  className="h-9 border rounded-lg px-2 text-xs outline-none focus:border-purple-500 bg-white text-slate-700"
                                >
                                  <option value="true">Activa</option>
                                  <option value="false">Inactiva</option>
                                </select>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBatchRow(index)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                  title="Quitar Fila"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}

                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Botón de Guardado del Batch */}
                {isBatchMode && (
                  <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
                    <span className="text-xs text-amber-600 flex items-center gap-1.5 mr-auto">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Cambios temporales guardados localmente. Haz clic en "Guardar Cambios" para aplicarlos.</span>
                    </span>
                    <button
                      onClick={handleToggleBatchMode}
                      className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={handleSaveBatch}
                      disabled={savingBatch}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-xs transition disabled:opacity-50"
                    >
                      {savingBatch ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-4">
              <Layers className="h-12 w-12 text-slate-300" />
              <div>
                <p className="font-bold text-slate-700">Ningún Área Seleccionada</p>
                <p className="text-xs text-slate-400 mt-1">Selecciona un área de la lista de la izquierda para administrar sus detalles y subáreas.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL DE IMPORTAR EXCEL ÁREAS */}
      {isImportAreasOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                <span>Carga Masiva de Áreas</span>
              </h2>
              <button onClick={() => setIsImportAreasOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleImport(e, "areas")} className="p-6 space-y-4">
              {importError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-xs flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-lg text-xs flex gap-2">
                  <Check className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{importSuccess}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-purple-600" />
                  <span>Formato del Excel requerido:</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 pl-1.5 font-medium">
                  <li>Columna A: `ID_Area` (Slug único - Ej: `recursos-humanos`)</li>
                  <li>Columna B: `Nombre` (Obligatorio)</li>
                  <li>Columna C: `Emoji` (Opcional - Ej: 🧑‍💼)</li>
                  <li>Columna D: `Descripcion` (Opcional)</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Archivo Excel (.xlsx)</label>
                <input
                  required
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImportFile(e.target.files[0]);
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-purple-500 bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsImportAreasOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={importLoading || !importFile}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {importLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{importLoading ? "Procesando..." : "Importar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPORTAR EXCEL SUBÁREAS */}
      {isImportSubAreasOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                <span>Carga Masiva de Subáreas</span>
              </h2>
              <button onClick={() => setIsImportSubAreasOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleImport(e, "subareas")} className="p-6 space-y-4">
              {importError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-xs flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-lg text-xs flex gap-2">
                  <Check className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{importSuccess}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-purple-600" />
                  <span>Formato del Excel requerido:</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 pl-1.5 font-medium">
                  <li>Columna A: `ID_Area_Padre` (Opcional si usas el selector inferior)</li>
                  <li>Columna B: `Nombre` (Obligatorio)</li>
                  <li>Columna C: `Emoji` (Opcional - Ej: 🔍)</li>
                  <li>Columna D: `Descripcion` (Opcional)</li>
                  <li>Columna E: `Objetivos` (Opcional)</li>
                  <li>Columna F: `Habilidades` (Opcional)</li>
                  <li>Columna G: `Nivel` (Opcional - Ej: Principiante)</li>
                </ul>
              </div>

              {/* Selector interactivo de área de destino para huérfanas */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-2">
                <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <ArrowRightLeft className="h-4.5 w-4.5" />
                  <span>Asignación de Área Destino</span>
                </p>
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                  ¿A qué Área deseas ligar las subáreas huérfanas (que no tengan área definida en la columna A)?
                </p>
                <select
                  value={defaultAreaId}
                  onChange={(e) => setDefaultAreaId(e.target.value)}
                  className="w-full h-9 border rounded-lg px-2 text-xs outline-none focus:border-purple-500 bg-white text-slate-700 mt-1.5"
                >
                  <option value="">-- No autocompletar (fallar si falta) --</option>
                  {areas.map(a => (
                    <option key={a.idArea} value={a.idArea}>{a.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Archivo Excel (.xlsx)</label>
                <input
                  required
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImportFile(e.target.files[0]);
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-purple-500 bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsImportSubAreasOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={importLoading || !importFile}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {importLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{importLoading ? "Procesando..." : "Importar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UNITARIO: ÁREA */}
      {isAreaModalOpen && (
        <AreaFormModal
          onClose={() => setIsAreaModalOpen(false)}
          onSuccess={() => {
            setIsAreaModalOpen(false);
            cargarAreas();
          }}
          editingItem={editingArea}
        />
      )}

      {/* MODAL UNITARIO: SUBÁREA */}
      {isSubAreaModalOpen && (
        <SubAreaFormModal
          onClose={() => setIsSubAreaModalOpen(false)}
          onSuccess={() => {
            setIsSubAreaModalOpen(false);
            if (selectedArea) cargarSubareas(selectedArea.idArea);
          }}
          editingItem={editingSubArea ? editingSubArea : (selectedArea ? { areaId: selectedArea.idArea } : null)}
        />
      )}
    </div>
  );
}
