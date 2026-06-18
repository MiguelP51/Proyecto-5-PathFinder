"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import DISCQuestionFormModal from "@/components/admin/DISCQuestionFormModal";

interface Opcion {
  idOpcionPreguntaDisc: number;
  textoOpcion: string;
  valorRespuesta: number;
  ordenOpcion: number;
  activo: boolean;
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

  const [preguntas, setPreguntas] = useState<PreguntaDISC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PreguntaDISC | null>(null);

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

  useEffect(() => {
    if (status === "authenticated" && session?.backendJwt) {
      cargarPreguntas();
    }
  }, [status, session, selectedCategoria]);

  const handleEliminarPregunta = async (item: PreguntaDISC) => {
    if (
      !confirm(
        `¿Seguro que deseas desactivar esta pregunta? Se realizará una desactivación lógica para conservar el historial de respuestas.`
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
      alert("Error al desactivar la pregunta");
    }
  };

  const filteredPreguntas = preguntas.filter(
    (p) =>
      p.enunciado?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      p.activo
  );

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Gestión de Preguntas DISC
          </h1>
          <p className="mt-2 text-slate-500 text-sm md:text-base">
            Administra los enunciados, opciones y pesos del test psicométrico DISC del estudiante.
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
          <span>Nueva Pregunta</span>
        </button>
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
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:shadow-md transition"
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
                </div>

                <p className="font-extrabold text-slate-800 text-base leading-relaxed">
                  {item.enunciado}
                </p>

                {/* Opciones */}
                <div className="grid grid-cols-2 gap-2 max-w-xl pt-2">
                  {item.opciones.map((opcion) => (
                    <div
                      key={opcion.idOpcionPreguntaDisc}
                      className="flex justify-between items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs"
                    >
                      <span className="text-slate-600 truncate">{opcion.textoOpcion}</span>
                      <span className="font-bold text-purple-600 ml-2" title="Peso psicométrico">
                        {opcion.valorRespuesta} pts
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
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0E3E66] bg-[#0E3E66]/5 hover:bg-[#0E3E66]/10 px-4 py-2 rounded-xl transition"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleEliminarPregunta(item)}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Desactivar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </section>

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
    </div>
  );
}
