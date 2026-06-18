// HU-EST-22: Resultado del diagnóstico inicial (celebración)
// HU-EST-23: Informe diagnóstico con habilidades y recomendación de SkillPath según nivel
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, BarChart3, BookOpen, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

interface ResultadoDTO {
  idDiagnostico: number;
  puntaje: number;
  totalPreguntas: number;
  respuestasCorrectas: number;
  nivelRecomendado: string;
  estado: string;
}

interface SubAreaDTO {
  idSubarea: number;
  nombre: string;
  habilidadesRelacionadas: string;
  slug: string;
}

interface SkillPathDTO {
  id: string;
  title: string;
  platform: string;
  description: string;
  difficulty: string;
  durationLabel: string;
  xp: number;
  progressPercentage: number;
  status: string;
  isRecommended: boolean;
}

interface ConfettiPiece {
  id: number;
  left: string;
  top: string;
  width: string;
  height: string;
  color: string;
  borderRadius: string;
  rotate: string;
  duration: string;
  delay: string;
}

function Confetti({ visible }: { visible: boolean }) {
  const [pieces] = useState<ConfettiPiece[]>(() => {
    const colors = ["#6f63ff", "#c850c0", "#f73586", "#ff6a00", "#ffd700", "#00d4aa"];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `-${10 + Math.random() * 20}%`,
      width: `${6 + Math.random() * 8}px`,
      height: `${6 + Math.random() * 8}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      rotate: `${Math.random() * 360}deg`,
      duration: `${2 + Math.random() * 2}s`,
      delay: `${Math.random() * 1}s`,
    }));
  });

  return (
    <>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s" }}
      >
        {pieces.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              borderRadius: p.borderRadius,
              animation: `fall ${p.duration} ${p.delay} ease-in forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// Normaliza distintas variantes de dificultad presentes en los datos de SkillPath
// (algunos registros usan BASICO/INTERMEDIO/AVANZADO, otros Fácil/Media/Difícil)
function normalizarDificultad(d?: string): "BASICO" | "INTERMEDIO" | "AVANZADO" {
  const v = (d ?? "").toUpperCase();
  if (["BASICO", "BÁSICO", "FACIL", "FÁCIL"].includes(v)) return "BASICO";
  if (["AVANZADO", "DIFICIL", "DIFÍCIL"].includes(v)) return "AVANZADO";
  return "INTERMEDIO";
}

// Traduce el nivel recomendado del diagnóstico (Principiante/Intermedio/Avanzado)
// a la escala de dificultad usada en SkillPath
function nivelADificultad(nivel: string): "BASICO" | "INTERMEDIO" | "AVANZADO" {
  const v = nivel.toUpperCase();
  if (v.startsWith("PRINCIPIANTE")) return "BASICO";
  if (v.startsWith("AVANZADO")) return "AVANZADO";
  return "INTERMEDIO";
}

export default function ResultadoDiagnosticoPage({
  params,
}: {
  params: Promise<{ area: string; idSubarea: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [area, setArea] = useState("");
  const [idSubarea, setIdSubarea] = useState("");
  const [resultado, setResultado] = useState<ResultadoDTO | null>(null);
  const [subarea, setSubarea] = useState<SubAreaDTO | null>(null);
  const [skillPaths, setSkillPaths] = useState<SkillPathDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [confettiVisible, setConfettiVisible] = useState(true);

  // HU-EST-23: cuando se accede desde el dashboard a revisar un diagnóstico ya generado,
  // se omite la celebración (confeti, "Próximos pasos") porque no es la primera vez.
  const esModoConsulta = searchParams.get("modo") === "consulta";

  useEffect(() => {
    params.then(({ area, idSubarea }) => {
      setArea(area);
      setIdSubarea(idSubarea);
    });
  }, [params]);

  // Carga el resultado del diagnóstico
  useEffect(() => {
    const idDiagnostico = searchParams.get("id");
    if (!idDiagnostico || !session?.backendJwt) return;

    apiFetch<ResultadoDTO>(
      `/api/diagnostico/${idDiagnostico}/resultado`,
      {},
      session.backendJwt
    )
      .then(setResultado)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams, session]);

  // HU-EST-23 bloque 2 y 3: carga la subárea (para habilidades) y luego sus SkillPaths (para recomendación)
  useEffect(() => {
    if (!idSubarea || !session?.backendJwt) return;

    apiFetch<SubAreaDTO>(
      `/api/exploracion/subareas/${idSubarea}`,
      {},
      session.backendJwt
    )
      .then((subareaData) => {
        setSubarea(subareaData);
        if (!subareaData.slug) return Promise.resolve([] as SkillPathDTO[]);
        return apiFetch<SkillPathDTO[]>(
          `/api/skillpaths/estudiante?subareaId=${subareaData.slug}`,
          {},
          session.backendJwt
        );
      })
      .then((spData) => setSkillPaths(spData ?? []))
      .catch((error) => {
        console.error("Error cargando habilidades/SkillPaths para el informe:", error);
      });
  }, [idSubarea, session]);

  // Desvanecer confetti después de 3 segundos — solo aplica a la celebración real,
  // no cuando se está consultando un informe ya generado anteriormente.
  useEffect(() => {
    if (!resultado || esModoConsulta) return;
    const timer = setTimeout(() => setConfettiVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [resultado, esModoConsulta]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5ff]">
      <Loader2 className="h-8 w-8 animate-spin text-[#6f63ff]" />
    </div>
  );

  if (!resultado) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5ff]">
      <p className="text-slate-500">No se pudo cargar el resultado</p>
    </div>
  );

  const habilidades = subarea?.habilidadesRelacionadas
    ?.split(",").map((h) => h.trim()).filter(Boolean) ?? [];

  const dificultadObjetivo = nivelADificultad(resultado.nivelRecomendado);
  const skillPathsRecomendados = skillPaths
    .filter((sp) => normalizarDificultad(sp.difficulty) === dificultadObjetivo)
    .slice(0, 2);

  const irASkillPath = (sp: SkillPathDTO) => {
    const returnTo = `/areas/${area}/subareas/${idSubarea}/dashboard`;
    router.push(`/user/app/skillpaths/${sp.id}?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f5ff] flex items-center justify-center px-6 py-10">
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-lg p-8 w-full max-w-md text-center overflow-hidden">
        {!esModoConsulta && <Confetti visible={confettiVisible} />}

        {/* Icono */}
        {esModoConsulta ? (
          <div className="relative z-10 mx-auto mb-4 h-16 w-16 rounded-full bg-[#f0eeff] flex items-center justify-center text-[#6f63ff]">
            <BarChart3 className="h-7 w-7" />
          </div>
        ) : (
          <div className="relative z-10 mx-auto mb-4 h-16 w-16 rounded-full border-4 border-orange-400 flex items-center justify-center text-orange-400 text-2xl font-black">
            !
          </div>
        )}

        <h1 className="relative z-10 text-2xl font-black text-slate-900 mb-1">
          {esModoConsulta ? "Tu informe de diagnóstico" : "¡Diagnóstico Completado!"}
        </h1>
        <p className="relative z-10 text-slate-500 text-sm mb-6">
          {esModoConsulta ? "Resultado de tu último diagnóstico en esta subárea" : "Subárea evaluada"}
        </p>

        {/* Bloque 1: Puntaje */}
        <p
          className="relative z-10 text-5xl font-black mb-1"
          style={{ color: "#6f63ff" }}
        >
          {resultado.puntaje}%
        </p>
        <p className="relative z-10 text-slate-500 text-sm mb-6">Puntuación obtenida</p>

        <div className="relative z-10 bg-slate-50 rounded-xl p-4 mb-4 text-left">
          <p className="font-bold text-slate-900 mb-3">Resultados del Diagnóstico 🎯</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Preguntas respondidas:</span>
              <span className="font-semibold">{resultado.totalPreguntas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Respuestas correctas:</span>
              <span className="font-semibold">{resultado.respuestasCorrectas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nivel recomendado:</span>
              <span className="font-semibold">{resultado.nivelRecomendado}</span>
            </div>
          </div>
        </div>

        {/* Bloque 2: Habilidades de esta subárea */}
        {habilidades.length > 0 && (
          <div className="relative z-10 bg-slate-50 rounded-xl p-4 mb-4 text-left">
            <p className="font-bold text-slate-900 mb-3">
              🎯 Tus habilidades actuales en esta subárea
            </p>
            <div className="flex flex-wrap gap-2">
              {habilidades.map((h, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-600"
                >
                  {h}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Nivel alcanzado: <span className="font-semibold text-[#6f63ff]">{resultado.nivelRecomendado}</span>
            </p>
          </div>
        )}

        {/* Bloque 3: Recomendación de SkillPath según nivel */}
        {skillPathsRecomendados.length > 0 && (
          <div className="relative z-10 bg-[#f0eeff] rounded-xl p-4 mb-6 text-left">
            <p className="font-bold text-slate-900 mb-3">
              🚀 Recomendado para ti
            </p>
            <div className="space-y-2">
              {skillPathsRecomendados.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => irASkillPath(sp)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3 text-left hover:border-[#6f63ff] transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{sp.title}</p>
                      <p className="text-xs text-slate-400">{sp.platform} · {sp.durationLabel}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#6f63ff] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Próximos pasos: solo tiene sentido la primera vez, no al consultar después */}
        {!esModoConsulta && skillPathsRecomendados.length === 0 && (
          <div className="relative z-10 bg-[#f0eeff] rounded-xl p-4 mb-6 text-left">
            <p className="font-bold text-slate-900 mb-2">🎯 Próximos Pasos 🚀</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Accede a tu dashboard de la subárea</li>
              <li>• Explora SkillPaths recomendados según tu nivel</li>
              <li>• Comienza PathChallenges para aplicar tus conocimientos</li>
              <li>• Agenda entrevistas con PathMentors</li>
            </ul>
          </div>
        )}

        {/* Botones */}
        <div className="relative z-10 flex gap-3">
          {!esModoConsulta && (
            <button
              onClick={() => router.push("/areas")}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 transition"
            >
              Explorar otras áreas
            </button>
          )}
          <button
            onClick={() => router.push(`/areas/${area}/subareas/${idSubarea}/dashboard`)}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition"
            style={{ background: "linear-gradient(135deg, #6f63ff, #c850c0)" }}
          >
            {esModoConsulta ? "Volver al dashboard" : "Ir al Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}