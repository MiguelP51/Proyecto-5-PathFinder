// HU-EST-22: Diagnóstico inicial de subárea
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

interface PreguntaDTO {
  idPreguntaDiagnostico: number;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  orden: number;
}

interface DiagnosticoIniciadoDTO {
  idDiagnostico: number;
  estado: string;
  preguntas: PreguntaDTO[];
}

export default function DiagnosticoPage({
  params,
}: {
  params: Promise<{ area: string; idSubarea: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const [area, setArea] = useState("");
  const [idSubarea, setIdSubarea] = useState("");
  const [diagnostico, setDiagnostico] = useState<DiagnosticoIniciadoDTO | null>(null);
  const [subareaNombre, setSubareaNombre] = useState("Subárea");
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ area, idSubarea }) => {
      setArea(area);
      setIdSubarea(idSubarea);
    });
  }, [params]);

  useEffect(() => {
    if (!idSubarea || !session?.backendJwt) return;

    // Obtener nombre de la subárea
    apiFetch<{ nombre: string }>(
      `/api/exploracion/subareas/${idSubarea}`,
      {},
      session.backendJwt
    ).then((data: any) => setSubareaNombre(data.nombre)).catch(() => {});

    // Iniciar diagnóstico
    apiFetch<DiagnosticoIniciadoDTO>(
      `/api/diagnostico/subarea/${idSubarea}/iniciar`,
      { method: "POST" },
      session.backendJwt
    )
      .then(setDiagnostico)
      .catch(() => setError("No se pudo iniciar el diagnóstico"))
      .finally(() => setLoading(false));
  }, [idSubarea, session]);

  const pregunta = diagnostico?.preguntas[preguntaActual];
  const totalPreguntas = diagnostico?.preguntas.length ?? 0;
  const progreso = totalPreguntas > 0 ? Math.round((preguntaActual / totalPreguntas) * 100) : 0;
  const respuestaSeleccionada = pregunta ? respuestas[pregunta.idPreguntaDiagnostico] : null;
  const esUltima = preguntaActual === totalPreguntas - 1;

  const handleSeleccionar = (opcion: string) => {
    if (!pregunta) return;
    setRespuestas((prev) => ({ ...prev, [pregunta.idPreguntaDiagnostico]: opcion }));
  };

  const handleSiguiente = async () => {
    if (!pregunta || !respuestaSeleccionada || !diagnostico) return;
    setGuardando(true);
    try {
      await apiFetch(
        `/api/diagnostico/${diagnostico.idDiagnostico}/responder`,
        {
          method: "POST",
          body: JSON.stringify({
            idPreguntaDiagnostico: pregunta.idPreguntaDiagnostico,
            respuestaElegida: respuestaSeleccionada,
          }),
        },
        session?.backendJwt
      );

      if (esUltima) {
        await apiFetch(
          `/api/diagnostico/${diagnostico.idDiagnostico}/finalizar`,
          { method: "POST" },
          session?.backendJwt
        );
        router.push(`/areas/${area}/subareas/${idSubarea}/diagnostico/resultado?id=${diagnostico.idDiagnostico}`);
      } else {
        setPreguntaActual((prev) => prev + 1);
      }
    } catch {
      setError("Error al guardar respuesta. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    router.push(`/areas/${area}/subareas/${idSubarea}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5ff]">
      <Loader2 className="h-8 w-8 animate-spin text-[#6f63ff]" />
    </div>
  );

  if (error || !diagnostico || !pregunta) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f5f5ff]">
      <p className="text-slate-500">{error ?? "Error cargando el diagnóstico"}</p>
      <Link href={`/areas/${area}/subareas/${idSubarea}`} className="text-[#6f63ff] hover:underline">
        Volver a la subárea
      </Link>
    </div>
  );

  const opciones = [
    { letra: "A", texto: pregunta.opcionA },
    { letra: "B", texto: pregunta.opcionB },
    { letra: "C", texto: pregunta.opcionC },
    { letra: "D", texto: pregunta.opcionD },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5ff] flex flex-col">
      <div className="mx-auto w-full max-w-2xl px-6 py-10 flex flex-col">

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            Diagnóstico: {subareaNombre}
          </h1>
          <p className="text-slate-500 text-sm">
            Responde estas preguntas para evaluar tu nivel actual
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Pregunta {preguntaActual + 1} de {totalPreguntas}</span>
            <span className="font-bold text-[#6f63ff]">{progreso}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progreso}%`,
                background: "linear-gradient(90deg, #6f63ff, #c850c0)",
              }}
            />
          </div>
        </div>

        {/* Card de pregunta */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">{pregunta.enunciado}</h2>
          <p className="text-sm text-slate-400 mb-6">Selecciona la respuesta correcta</p>

          <div className="space-y-3">
            {opciones.map((opcion) => {
              const seleccionada = respuestaSeleccionada === opcion.letra;
              return (
                <button
                  key={opcion.letra}
                  onClick={() => handleSeleccionar(opcion.letra)}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition flex items-center gap-3 ${
                    seleccionada
                      ? "border-[#6f63ff] bg-[#f0eeff] text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      seleccionada ? "border-[#6f63ff]" : "border-slate-300"
                    }`}
                  >
                    {seleccionada && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#6f63ff]" />
                    )}
                  </span>
                  {opcion.texto}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleCancelar}
            className="text-sm text-slate-500 hover:text-slate-700 transition"
          >
            Cancelar diagnóstico
          </button>
          <button
            onClick={handleSiguiente}
            disabled={!respuestaSeleccionada || guardando}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #6f63ff, #c850c0)" }}
          >
            {guardando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : esUltima ? (
              "Finalizar"
            ) : (
              "Siguiente"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
