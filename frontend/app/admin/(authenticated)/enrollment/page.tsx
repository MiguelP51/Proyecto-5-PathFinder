"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  GripVertical, 
  Settings, 
  Plus, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Save, 
  Check, 
  X, 
  PlusCircle, 
  Folder, 
  Briefcase, 
  Search,
  Eye,
  CheckCircle2,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CvField {
  idCampo: number;
  clave: string;
  label: string;
  tipo: string; // TEXT, TEXTAREA
  requerido: boolean;
  activo: boolean;
  orden: number;
  esCustom: boolean;
}

interface Puesto {
  idPuesto: number;
  nombre: string;
  activo: boolean;
}

interface Area {
  idArea: number;
  nombre: string;
  activo: boolean;
  puestos: Puesto[];
}

export default function EnrollmentConfigPage() {
  const { data: session, status } = useSession();
  const token = session?.backendJwt;

  const [activeTab, setActiveTab] = useState<"cv" | "jobs">("cv");
  const [loadingCv, setLoadingCv] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // CV Fields States
  const [cvFields, setCvFields] = useState<CvField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("TEXT");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [savingReorder, setSavingReorder] = useState(false);

  // Areas and Jobs States
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [newAreaNombre, setNewAreaNombre] = useState("");
  const [newPuestoNombre, setNewPuestoNombre] = useState("");
  const [jobSearch, setJobSearch] = useState("");

  // Notification Banner State
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Fetch CV Fields
  const fetchCvFields = async () => {
    if (!token) return;
    setLoadingCv(true);
    try {
      const data = await apiFetch<CvField[]>("/api/admin/enrollment/cv-fields", {}, token);
      setCvFields(data || []);
    } catch (err: any) {
      console.error(err);
      showMessage(err.message || "Error al cargar campos de CV", "error");
    } finally {
      setLoadingCv(false);
    }
  };

  // Fetch Areas and Positions
  const fetchAreas = async () => {
    if (!token) return;
    setLoadingJobs(true);
    try {
      const data = await apiFetch<Area[]>("/api/admin/enrollment/areas", {}, token);
      setAreas(data || []);
      if (data && data.length > 0 && !selectedAreaId) {
        setSelectedAreaId(data[0].idArea);
      }
    } catch (err: any) {
      console.error(err);
      showMessage(err.message || "Error al cargar áreas y puestos", "error");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && token) {
      fetchCvFields();
      fetchAreas();
    }
  }, [status, token]);

  // CV Field Handlers
  const handleCreateCvField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    try {
      const newField = await apiFetch<CvField>("/api/admin/enrollment/cv-fields", {
        method: "POST",
        body: JSON.stringify({
          label: newFieldLabel.trim(),
          tipo: newFieldType,
          requerido: newFieldRequired
        })
      }, token);
      
      showMessage("Campo personalizado creado con éxito");
      setNewFieldLabel("");
      setNewFieldRequired(false);
      fetchCvFields();
    } catch (err: any) {
      showMessage(err.message || "Error al crear campo", "error");
    }
  };

  const handleUpdateCvField = async (field: CvField, updates: Partial<CvField>) => {
    try {
      await apiFetch(`/api/admin/enrollment/cv-fields/${field.idCampo}`, {
        method: "PUT",
        body: JSON.stringify({
          ...field,
          ...updates
        })
      }, token);
      
      showMessage("Campo actualizado con éxito");
      fetchCvFields();
    } catch (err: any) {
      showMessage(err.message || "Error al actualizar campo", "error");
    }
  };

  // Drag and Drop CV fields
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...cvFields.filter(f => f.activo)];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    // Re-index remaining fields
    const activeIds = list.map(f => f.idCampo);
    // Combine with inactive ones to keep them at the end or intact
    const inactiveIds = cvFields.filter(f => !f.activo).map(f => f.idCampo);
    const reorderedIds = [...activeIds, ...inactiveIds];

    // Optimistic update
    const updatedFields = cvFields.map(f => {
      const activeIdx = activeIds.indexOf(f.idCampo);
      if (activeIdx !== -1) {
        return { ...f, orden: activeIdx };
      }
      return f;
    }).sort((a, b) => a.orden - b.orden);
    
    setCvFields(updatedFields);
    setSavingReorder(true);

    try {
      await apiFetch("/api/admin/enrollment/cv-fields/reorder", {
        method: "PUT",
        body: JSON.stringify(reorderedIds)
      }, token);
      showMessage("Orden de campos guardado");
      fetchCvFields();
    } catch (err: any) {
      showMessage(err.message || "Error al guardar el nuevo orden", "error");
      fetchCvFields();
    } finally {
      setSavingReorder(false);
      setDraggedIndex(null);
    }
  };

  // Areas & Jobs Handlers
  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaNombre.trim()) return;
    try {
      const area = await apiFetch<Area>("/api/admin/enrollment/areas", {
        method: "POST",
        body: JSON.stringify({ nombre: newAreaNombre.trim() })
      }, token);
      showMessage("Área creada con éxito");
      setNewAreaNombre("");
      fetchAreas();
      setSelectedAreaId(area.idArea);
    } catch (err: any) {
      showMessage(err.message || "Error al crear área", "error");
    }
  };

  const handleUpdateArea = async (area: Area, updates: Partial<Area>) => {
    try {
      await apiFetch(`/api/admin/enrollment/areas/${area.idArea}`, {
        method: "PUT",
        body: JSON.stringify({
          ...area,
          ...updates
        })
      }, token);
      showMessage("Área actualizada con éxito");
      fetchAreas();
    } catch (err: any) {
      showMessage(err.message || "Error al actualizar área", "error");
    }
  };

  const handleCreatePuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPuestoNombre.trim() || !selectedAreaId) return;
    try {
      await apiFetch(`/api/admin/enrollment/areas/${selectedAreaId}/puestos`, {
        method: "POST",
        body: JSON.stringify({ nombre: newPuestoNombre.trim() })
      }, token);
      showMessage("Puesto creado con éxito");
      setNewPuestoNombre("");
      fetchAreas();
    } catch (err: any) {
      showMessage(err.message || "Error al crear puesto", "error");
    }
  };

  const handleUpdatePuesto = async (puestoId: number, currentPuesto: Puesto, updates: Partial<Puesto>) => {
    try {
      await apiFetch(`/api/admin/enrollment/areas/puestos/${puestoId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...currentPuesto,
          ...updates
        })
      }, token);
      showMessage("Puesto actualizado con éxito");
      fetchAreas();
    } catch (err: any) {
      showMessage(err.message || "Error al actualizar puesto", "error");
    }
  };

  // Get active and inactive fields for split render
  const activeFields = cvFields.filter(f => f.activo).sort((a, b) => a.orden - b.orden);
  const inactiveFields = cvFields.filter(f => !f.activo);

  // Selected Area & filtered jobs
  const selectedArea = areas.find(a => a.idArea === selectedAreaId);
  const filteredPuestos = selectedArea
    ? selectedArea.puestos.filter(p => 
        p.nombre.toLowerCase().includes(jobSearch.toLowerCase())
      )
    : [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600 animate-spin-slow" />
            Configuración de Enrolamiento
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Personaliza el flujo de registro y postulación de estudiantes universitarios.
          </p>
        </div>
      </div>

      {/* Floating Status Notification */}
      {message && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-300 animate-bounce ${
          message.type === "success" 
            ? "bg-emerald-600 text-white shadow-emerald-100" 
            : "bg-rose-600 text-white shadow-rose-100"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("cv")}
          className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "cv" 
              ? "bg-white text-[#0E3E66] shadow-md shadow-slate-200/50" 
              : "text-slate-500 hover:text-[#0E3E66]"
          }`}
        >
          <GripVertical className="h-4 w-4" />
          Formulario de Registro (CV)
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "jobs" 
              ? "bg-white text-[#0E3E66] shadow-md shadow-slate-200/50" 
              : "text-slate-500 hover:text-[#0E3E66]"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Áreas y Puestos de Simulación
        </button>
      </div>

      {/* CV FIELDS TAB */}
      {activeTab === "cv" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Controls Panel (Left side - 7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Add Custom Field Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-blue-500" />
                Agregar Campo Personalizado
              </h2>
              <form onSubmit={handleCreateCvField} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Campo</label>
                  <input
                    type="text"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="Ej. Expectativa Salarial"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Input</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white"
                  >
                    <option value="TEXT">Línea de Texto</option>
                    <option value="TEXTAREA">Bloque de Texto</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 py-3 justify-center">
                  <input
                    type="checkbox"
                    id="newRequired"
                    checked={newFieldRequired}
                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                    className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <label htmlFor="newRequired" className="text-xs font-bold text-slate-600 cursor-pointer">Requerido</label>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-bold transition shadow-md shadow-blue-100 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Crear
                  </button>
                </div>
              </form>
            </div>

            {/* Draggable Active Fields List */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Campos Activos del Formulario</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Arrastra los bloques para reordenar la vista del estudiante.</p>
                </div>
                {savingReorder && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 animate-pulse">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Guardando orden...
                  </span>
                )}
              </div>

              {loadingCv ? (
                <div className="text-center py-12 text-slate-400 font-medium">Cargando catálogo de campos...</div>
              ) : activeFields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium">
                  No hay campos activos. Agrega campos arriba o reactívalos abajo.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeFields.map((field, idx) => (
                    <div
                      key={field.idCampo}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      className="flex items-center justify-between bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs p-3.5 rounded-2xl transition group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="cursor-grab text-slate-400 hover:text-slate-600 p-1 group-active:cursor-grabbing">
                          <GripVertical className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">{field.label}</span>
                            {field.esCustom && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase border border-slate-200/50">Personalizado</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Clave: {field.clave} • Tipo: {field.tipo}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.requerido}
                            onChange={(e) => handleUpdateCvField(field, { requerido: e.target.checked })}
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          />
                          <span className="text-xs text-slate-500 font-bold">Obligatorio</span>
                        </div>
                        <button
                          onClick={() => handleUpdateCvField(field, { activo: false })}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Desactivar campo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inactive/Deactivated Fields */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/50 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-slate-500" />
                  Campos Desactivados (Historial)
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Campos que ya no se piden a nuevos estudiantes, pero cuyos datos del pasado se mantienen intactos.</p>
              </div>

              {inactiveFields.length === 0 ? (
                <p className="text-xs font-semibold text-slate-400 italic">No hay campos desactivados.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inactiveFields.map(field => (
                    <div key={field.idCampo} className="flex items-center justify-between bg-white border border-slate-200/60 p-3 rounded-2xl shadow-2xs">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">{field.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{field.tipo}</span>
                      </div>
                      <button
                        onClick={() => handleUpdateCvField(field, { activo: true })}
                        className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Reactivar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Student Live Preview Panel (Right side - 5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-slate-900 text-slate-100 rounded-3xl shadow-xl overflow-hidden border border-slate-800">
              {/* Preview Bar */}
              <div className="bg-slate-800/80 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-blue-400" /> Vista Previa del Estudiante
                </span>
                <span className="text-[10px] bg-slate-900 text-blue-400 font-black px-2 py-0.5 rounded-full border border-blue-900/50">EN VIVO</span>
              </div>

              {/* Preview Container */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-base font-black text-white">Completar Datos del Perfil</h3>
                  <p className="text-slate-400 text-xs mt-1">Por favor, rellena los campos adicionales configurados por tu facultad.</p>
                </div>

                <div className="space-y-4">
                  {activeFields.map((field) => (
                    <div key={field.idCampo} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        {field.label}
                        {field.requerido && <span className="text-rose-500 font-bold">*</span>}
                      </label>

                      {field.tipo === "TEXTAREA" ? (
                        <textarea
                          placeholder={`Escribe aquí tu ${field.label.toLowerCase()}...`}
                          disabled
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 placeholder-slate-600 outline-none resize-none h-20"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={`Escribe aquí tu ${field.label.toLowerCase()}...`}
                          disabled
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 placeholder-slate-600 outline-none"
                        />
                      )}
                    </div>
                  ))}
                  
                  {activeFields.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs font-medium">
                      No hay campos adicionales activos para mostrar.
                    </div>
                  )}

                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 text-xs font-bold shadow-lg shadow-blue-950 opacity-90 mt-4 cursor-not-allowed"
                  >
                    Guardar y Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AREAS & JOBS CATALOG TAB */}
      {activeTab === "jobs" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Areas Management (Left - 5 cols) */}
          <div className="md:col-span-5 space-y-6">
            {/* Create Area Form */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3.5">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-500" />
                Nueva Área de Simulación
              </h2>
              <form onSubmit={handleCreateArea} className="flex gap-2.5">
                <input
                  type="text"
                  value={newAreaNombre}
                  onChange={(e) => setNewAreaNombre(e.target.value)}
                  placeholder="Ej. Finanzas y Contabilidad"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition shadow-sm shadow-blue-100 cursor-pointer"
                >
                  Agregar
                </button>
              </form>
            </div>

            {/* Areas List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3.5">
              <h2 className="text-base font-bold text-slate-800">Catálogo de Áreas</h2>
              {loadingJobs ? (
                <div className="text-center py-12 text-slate-400 font-medium">Cargando áreas...</div>
              ) : areas.length === 0 ? (
                <p className="text-center py-12 text-slate-400 font-medium">No hay áreas registradas.</p>
              ) : (
                <div className="space-y-2">
                  {areas.map(area => (
                    <div
                      key={area.idArea}
                      onClick={() => setSelectedAreaId(area.idArea)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition border ${
                        selectedAreaId === area.idArea
                          ? "bg-blue-50/50 border-blue-200 shadow-sm"
                          : "bg-white border-slate-200/60 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Folder className={`h-4.5 w-4.5 ${selectedAreaId === area.idArea ? "text-blue-600" : "text-slate-400"}`} />
                        <div>
                          <span className={`text-sm font-bold block ${selectedAreaId === area.idArea ? "text-blue-900" : "text-slate-800"}`}>
                            {area.nombre}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {area.puestos?.length || 0} puestos
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleUpdateArea(area, { activo: !area.activo })}
                          className={`p-1 px-2.5 rounded-lg border text-[10px] font-black transition-all ${
                            area.activo 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {area.activo ? "Activo" : "Inactivo"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Positions Management (Right/Middle - 7 cols) */}
          <div className="md:col-span-7 space-y-6">
            {selectedArea ? (
              <>
                {/* Selected Area Title & Add Position */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3.5">
                    <div>
                      <h2 className="text-lg font-black text-[#0E3E66]">{selectedArea.nombre}</h2>
                      <p className="text-slate-400 text-xs font-semibold">Puestos y Roles de esta área de simulación</p>
                    </div>
                  </div>

                  {/* Create Position Form */}
                  <form onSubmit={handleCreatePuesto} className="flex gap-2.5">
                    <input
                      type="text"
                      value={newPuestoNombre}
                      onChange={(e) => setNewPuestoNombre(e.target.value)}
                      placeholder="Ej. Especialista de Reclutamiento y Selección"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition shadow-sm shadow-blue-100 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Agregar Puesto
                    </button>
                  </form>
                </div>

                {/* Positions list with Search */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Puestos Configurados</h3>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                        placeholder="Buscar puesto..."
                        className="rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition w-full sm:w-48 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {filteredPuestos.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-medium">
                      {selectedArea.puestos.length === 0 
                        ? "No hay puestos creados en esta área aún." 
                        : "No se encontraron puestos con el filtro actual."}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[50vh] overflow-y-auto pr-1">
                      {filteredPuestos.map((puesto) => (
                        <div key={puesto.idPuesto} className="flex items-center justify-between py-3 hover:bg-slate-50/30 px-2 rounded-xl transition">
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-800">{puesto.nombre}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleUpdatePuesto(puesto.idPuesto, puesto, { activo: !puesto.activo })}
                              className={`p-1 px-2.5 rounded-lg border text-[10px] font-black transition-all cursor-pointer ${
                                puesto.activo 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {puesto.activo ? "Activo" : "Inactivo"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-slate-50 rounded-3xl border border-slate-200/50 p-12 text-center text-slate-400 font-semibold">
                Selecciona un área del panel izquierdo para gestionar sus puestos de simulación.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
