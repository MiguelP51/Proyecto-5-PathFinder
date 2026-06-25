"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { Search, Plus, Edit2, Trash2, Brain } from "lucide-react";
import DISCQuestionFormModal from "@/components/admin/DISCQuestionFormModal";

interface Opcion {
  idOpcionPreguntaDisc: number;
  textoOpcion: string;
  valorRespuesta: number;
  ordenOpcion: number;
  activo: boolean;
  categoriaDisc?: string;
}

interface PreguntaDISC {
  idPreguntaDisc: number;
  enunciado: string;
  categoriaDisc: string;
  ordenPregunta: number;
  imagenUrl: string;
  obligatoria: boolean;
  activo: boolean;
  idTipoPreguntaDisc: number;
  codigoTipoPregunta: string;
  nombreTipoPregunta: string;
  cantidadOpciones: number;
  opciones: Opcion[];
}

export default function DISCQuestionsPage() {
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<'disc' | 'competencias'>('disc');

  const [preguntas, setPreguntas] = useState<PreguntaDISC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PreguntaDISC | null>(null);

  // Competencias State
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [loadingCompetencias, setLoadingCompetencias] = useState(false);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);

  // Form Fields for new Competencia
  const [compName, setCompName] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compL0, setCompL0] = useState("");
  const [compL1, setCompL1] = useState("");
  const [compL2, setCompL2] = useState("");
  const [compL3, setCompL3] = useState("");
  const [compPuesto, setCompPuesto] = useState("General");
  const [compSearchTerm, setCompSearchTerm] = useState("");

  const cargarPreguntas = async () => {
    try {
      setLoading(true);
      setError("");
      const url = selectedCategoria
        ? `/api/admin/disc/questions?categoriaDisc=${selectedCategoria}`
        : "/api/admin/disc/questions";
      const data = await apiFetch<PreguntaDISC[]>(url, {}, session?.backendJwt);
      setPreguntas(data || []);
    } catch (err) {
      console.error("Error al cargar preguntas DISC:", err);
      setError(err instanceof Error ? err.message : "No se pudieron recuperar las preguntas DISC");
    } finally {
      setLoading(false);
    }
  };

  const cargarCompetencias = async () => {
    try {
      setLoadingCompetencias(true);
      setError("");
      const data = await apiFetch<any[]>("/api/entrevistas/competencias", {}, session?.backendJwt);
      setCompetencias(data || []);
    } catch (err) {
      console.error("Error al cargar competencias:", err);
      setError(err instanceof Error ? err.message : "No se pudieron recuperar las competencias");
    } finally {
      setLoadingCompetencias(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      if (activeTab === 'disc') {
        cargarPreguntas();
      } else {
        cargarCompetencias();
      }
    }
  }, [status, session, selectedCategoria, activeTab]);

  const handleEliminarPregunta = async (item: PreguntaDISC) => {
    if (
      !confirm(
        `¿Seguro que deseas eliminar permanentemente la pregunta "${item.enunciado.substring(0, 60)}..."?\n\nEsta acción eliminará la pregunta, sus opciones y sus respuestas asociadas de la base de datos. No se puede deshacer.`
      )
    )
      return;

    try {
      await apiFetch(
        `/api/admin/disc/questions/${item.idPreguntaDisc}`,
        { method: "DELETE" },
        session?.backendJwt
      );
      cargarPreguntas();
    } catch (err) {
      alert("Error al eliminar la pregunta");
    }
  };

  const handleEliminarCompetencia = async (id: number, name: string) => {
    if (
      !confirm(
        `¿Seguro que deseas desactivar la competencia "${name}" del catálogo general? Esto evitará que aparezca en futuras evaluaciones sin alterar las evaluaciones históricas.`
      )
    )
      return;

    try {
      await apiFetch(
        `/api/entrevistas/competencias/${id}`,
        { method: "DELETE" },
        session?.backendJwt
      );
      cargarCompetencias();
    } catch (err) {
      alert("Error al desactivar la competencia");
    }
  };

  const handleCrearCompetenciaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
      alert("El nombre de la competencia es requerido");
      return;
    }

    const payload = {
      nombre: compName.trim(),
      descripcion: compDesc.trim() || `Competencia: ${compName.trim()}`,
      nivel0: compL0.trim() || "Por debajo del esperado",
      nivel1: compL1.trim() || "Alcanza los criterios mínimos",
      nivel2: compL2.trim() || "Supera los criterios mínimos",
      nivel3: compL3.trim() || "Supera las expectativas",
      puesto: compPuesto,
      activo: true
    };

    try {
      await apiFetch("/api/entrevistas/competencias", {
        method: "POST",
        body: JSON.stringify(payload)
      }, session?.backendJwt);

      // Reset
      setCompName("");
      setCompDesc("");
      setCompL0("");
      setCompL1("");
      setCompL2("");
      setCompL3("");
      setCompPuesto("General");
      setIsCompModalOpen(false);
      cargarCompetencias();
    } catch (err) {
      console.error("Error al crear competencia:", err);
      alert("Error al guardar la competencia");
    }
  };

  const handleResetTestDISC = async () => {
    if (
      !confirm(
        "⚠️ ¡ATENCIÓN! Esta acción es de alto riesgo e irreversible.\n\n" +
        "Se eliminarán de forma permanente de la base de datos:\n" +
        "1. Todos los tests DISC completados por los estudiantes (Historial de resultados).\n" +
        "2. Todas las respuestas dadas a las preguntas del test.\n" +
        "3. Las preguntas duplicadas e inactivas.\n\n" +
        "Se restablecerá exactamente el set oficial de 20 preguntas basadas en el Excel de la plantilla con sus opciones y pesos oficiales.\n\n" +
        "¿Estás seguro de que deseas proceder con el restablecimiento completo?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await apiFetch(
        "/api/admin/disc/questions/reset",
        { method: "DELETE" },
        session?.backendJwt
      );
      alert("¡El test DISC y el historial de respuestas se han restablecido correctamente!");
      cargarPreguntas();
    } catch (err) {
      console.error("Error al restablecer test DISC:", err);
      alert("Error al restablecer el test DISC: " + (err instanceof Error ? err.message : err));
    } finally {
      setLoading(false);
    }
  };

  const filteredPreguntas = preguntas.filter(
    (p) =>
      p.enunciado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            {activeTab === 'disc' ? 'Gestión de Preguntas DISC' : 'Competencias de Evaluación'}
          </h1>
          <p className="mt-2 text-slate-500 text-sm md:text-base">
            {activeTab === 'disc'
              ? 'Administra los enunciados, opciones y pesos del test psicométrico DISC del estudiante.'
              : 'Define y gestiona el catálogo de competencias y rúbricas utilizadas por los mentores en las entrevistas.'}
          </p>
        </div>
        {activeTab === 'disc' ? (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleResetTestDISC}
              className="flex items-center gap-2 self-start rounded-xl bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 px-4 py-2.5 transition text-sm font-bold cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Restablecer Test e Historial</span>
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 self-start rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 shadow-md shadow-purple-200 transition text-sm font-bold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Pregunta</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCompModalOpen(true)}
            className="flex items-center gap-2 self-start rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 shadow-md shadow-purple-200 transition text-sm font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Competencia</span>
          </button>
        )}
      </section>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200/80 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('disc')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'disc'
              ? 'border-b-2 border-purple-600 text-purple-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          Gestión de Preguntas DISC
        </button>
        <button
          onClick={() => setActiveTab('competencias')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'competencias'
              ? 'border-b-2 border-purple-600 text-purple-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          Competencias de Evaluación
        </button>
      </div>

      {activeTab === 'disc' && (
        <>
          {/* Sección Informativa: Cálculo de Pesos DISC */}
          <section className="bg-gradient-to-br from-purple-50 via-indigo-50/40 to-slate-50 border border-purple-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-200">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Cálculo de Pesos y Algoritmo de Perfiles DISC</h2>
                <p className="text-xs text-slate-500">Explicación del sistema de puntuación para el cliente y administradores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
              <div className="space-y-2 bg-white/60 p-4 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  1. Estructura del Test
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  Consiste en <strong>20 bloques</strong>. Los bloques 1-10 son de tipo <strong>"Me considero más"</strong> y los bloques 11-20 son de tipo <strong>"Me considero menos"</strong>. Cada bloque presenta 4 palabras alternativas.
                </p>
              </div>

              <div className="space-y-2 bg-white/60 p-4 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  2. Asignación y Acumulación
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  Cada palabra seleccionada corresponde a una dimensión: <strong>D</strong> (Dominancia), <strong>I</strong> (Influencia), <strong>S</strong> (Estabilidad) o <strong>C</strong> (Cumplimiento). Elegir una palabra sumará <strong>+1 punto</strong> a esa dimensión.
                </p>
              </div>

              <div className="space-y-2 bg-white/60 p-4 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  3. Perfil Dominante
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  Si una dimensión tiene <strong>12 o más puntos</strong> (≥60%), es el perfil único dominante. De lo contrario, se toman las <strong>dos dimensiones más altas</strong> para formar un perfil combinado (ej. <em>D + I</em>).
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-purple-100/50 flex flex-wrap gap-4 justify-between items-center text-xs">
              <span className="text-slate-400">
                * Cada bloque en base de datos tiene configuradas sus opciones asociadas a <strong>D</strong> (Valor 1), <strong>I</strong> (Valor 2), <strong>S</strong> (Valor 3) y <strong>C</strong> (Valor 4).
              </span>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md font-bold text-[10px]">D: Dominancia</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-bold text-[10px]">I: Influencia</span>
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md font-bold text-[10px]">S: Estabilidad</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md font-bold text-[10px]">C: Cumplimiento</span>
              </div>
            </div>
          </section>

          {/* Controles de Búsqueda y Filtros */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por enunciado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Dimensión:</span>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="h-11 border rounded-xl px-3 text-sm outline-none focus:border-purple-500 bg-slate-50/50 text-slate-700 min-w-[180px]"
              >
                <option value="">Todas las Dimensiones</option>
                <option value="D">D - Dominancia</option>
                <option value="I">I - Influencia</option>
                <option value="S">S - Estabilidad</option>
                <option value="C">C - Cumplimiento</option>
              </select>
            </div>
          </section>

          {/* Listado de Preguntas */}
          <section className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
                Cargando...
              </div>
            ) : filteredPreguntas.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                No se encontraron preguntas DISC
              </div>
            ) : (
              filteredPreguntas.map((item) => (
                <div
                  key={item.idPreguntaDisc}
                  className={`bg-white rounded-3xl border p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:shadow-md transition ${
                    item.activo
                      ? "border-slate-200/80"
                      : "border-slate-200/40 opacity-60 bg-slate-50/60"
                  }`}
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Orden #{item.ordenPregunta}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.categoriaDisc === "D"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : item.categoriaDisc === "I"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : item.categoriaDisc === "S"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        Dimensión {item.categoriaDisc}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.nombreTipoPregunta}
                      </span>
                      {item.obligatoria && (
                        <span className="text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                          * Obligatoria
                        </span>
                      )}
                      {!item.activo && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-500 border border-slate-300">
                          Inactiva
                        </span>
                      )}
                    </div>

                    <p className="font-extrabold text-slate-800 text-base leading-relaxed">
                      {item.enunciado}
                    </p>

                    {/* Opciones */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl pt-2">
                      {item.opciones.map((opcion) => (
                        <div
                          key={opcion.idOpcionPreguntaDisc}
                          className="flex justify-between items-center bg-slate-50 border border-slate-100/70 px-3 py-2 rounded-xl text-xs hover:border-purple-200/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-5 h-5 flex items-center justify-center rounded-lg text-[9px] font-black uppercase shadow-sm ${
                              opcion.categoriaDisc === "D"
                                ? "bg-red-50 text-red-700 border border-red-200/60"
                                : opcion.categoriaDisc === "I"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                : opcion.categoriaDisc === "S"
                                ? "bg-green-50 text-green-700 border border-green-200/60"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}>
                              {opcion.categoriaDisc || "?"}
                            </span>
                            <span className="text-slate-700 font-semibold truncate">{opcion.textoOpcion}</span>
                          </div>
                          <span className="font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg text-[10px] shrink-0 border border-purple-100" title="Valor en respuesta">
                            Valor: {opcion.valorRespuesta}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsFormOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0E3E66] bg-[#0E3E66]/5 hover:bg-[#0E3E66]/10 px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleEliminarPregunta(item)}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}

      {activeTab === 'competencias' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Controles de Búsqueda de Competencias */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar competencia por nombre..."
                value={compSearchTerm}
                onChange={(e) => setCompSearchTerm(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
              />
            </div>
          </section>

          {/* Listado de Competencias */}
          <section className="space-y-4">
            {loadingCompetencias ? (
              <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
                Cargando competencias...
              </div>
            ) : competencias.filter(c => c.activo && c.nombre?.toLowerCase().includes(compSearchTerm.toLowerCase())).length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                No se encontraron competencias en el catálogo general
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Competencia</th>
                      <th className="px-6 py-4">Nivel 0</th>
                      <th className="px-6 py-4">Nivel 1</th>
                      <th className="px-6 py-4">Nivel 2</th>
                      <th className="px-6 py-4">Nivel 3</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {competencias
                      .filter(c => c.activo && c.nombre?.toLowerCase().includes(compSearchTerm.toLowerCase()))
                      .map((comp) => (
                        <tr key={comp.idCompetencia} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 min-w-[200px]">
                            <div className="font-extrabold text-slate-800 text-sm">{comp.nombre}</div>
                            {comp.puesto && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">
                                {comp.puesto}
                              </span>
                            )}
                            {comp.descripcion && (
                              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{comp.descripcion}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 min-w-[140px] font-medium text-slate-500 leading-relaxed">{comp.nivel0}</td>
                          <td className="px-6 py-4 min-w-[140px] font-medium text-slate-500 leading-relaxed">{comp.nivel1}</td>
                          <td className="px-6 py-4 min-w-[140px] font-medium text-slate-500 leading-relaxed">{comp.nivel2}</td>
                          <td className="px-6 py-4 min-w-[140px] font-medium text-slate-500 leading-relaxed">{comp.nivel3}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEliminarCompetencia(comp.idCompetencia, comp.nombre)}
                              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition ml-auto cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Desactivar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {isFormOpen && (
        <DISCQuestionFormModal
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            cargarPreguntas();
          }}
          editingItem={editingItem}
        />
      )}

      {/* Modal para Crear Competencia */}
      {isCompModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col scale-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Nueva Competencia General</h3>
                <p className="text-xs text-slate-400 font-medium">Agrega una dimensión al catálogo global del sistema</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCompModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCrearCompetenciaSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[70vh]">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Nombre de la competencia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Liderazgo"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Descripción corta</label>
                <input
                  type="text"
                  placeholder="Ej. Capacidad de orientar la acción de los grupos humanos..."
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Puesto / Segmento</label>
                <select
                  value={compPuesto}
                  onChange={(e) => setCompPuesto(e.target.value)}
                  className="w-full h-10 border rounded-xl px-3 text-xs outline-none focus:border-purple-500 bg-slate-50/50 text-slate-700"
                >
                  <option value="General">General (Todas las entrevistas)</option>
                  <option value="Gestión">Gestión y Alta Dirección</option>
                  <option value="Tecnología">Tecnología / Ingeniería</option>
                  <option value="Recursos Humanos">Recursos Humanos (HR)</option>
                </select>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Definición de Niveles de Rúbrica:</span>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-red-600 block">Nivel 0 - Por debajo de lo esperado</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Comportamientos observados para el nivel 0..."
                    value={compL0}
                    onChange={(e) => setCompL0(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-blue-600 block">Nivel 1 - Alcanza los criterios mínimos</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Comportamientos observados para el nivel 1..."
                    value={compL1}
                    onChange={(e) => setCompL1(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-green-600 block">Nivel 2 - Supera los criterios mínimos</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Comportamientos observados para el nivel 2..."
                    value={compL2}
                    onChange={(e) => setCompL2(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-purple-600 block">Nivel 3 - Supera las expectativas</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Comportamientos observados para el nivel 3..."
                    value={compL3}
                    onChange={(e) => setCompL3(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs font-medium text-slate-700"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-extrabold text-slate-600 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Crear Competencia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
