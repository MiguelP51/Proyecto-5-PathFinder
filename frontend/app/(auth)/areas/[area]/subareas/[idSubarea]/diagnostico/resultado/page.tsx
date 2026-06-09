// HU-EST-22: Resultado del diagnóstico inicial
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [confettiVisible, setConfettiVisible] = useState(true);

  useEffect(() => {
    params.then(({ area, idSubarea }) => {
      setArea(area);
      setIdSubarea(idSubarea);
    });
  }, [params]);

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

  // Desvanecer confetti después de 3 segundos
  useEffect(() => {
    if (!resultado) return;
    const timer = setTimeout(() => setConfettiVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [resultado]);

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

  return (
    <div className="min-h-screen bg-[#f5f5ff] flex items-center justify-center px-6 py-10">
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-lg p-8 w-full max-w-md text-center overflow-hidden">
        <Confetti visible={confettiVisible} />

        {/* Icono */}
        <div className="relative z-10 mx-auto mb-4 h-16 w-16 rounded-full border-4 border-orange-400 flex items-center justify-center text-orange-400 text-2xl font-black">
          !
        </div>

        <h1 className="relative z-10 text-2xl font-black text-slate-900 mb-1">
          ¡Diagnóstico Completado!
        </h1>
        <p className="relative z-10 text-slate-500 text-sm mb-6">
          Subárea evaluada
        </p>

        {/* Puntaje */}
        <p
          className="relative z-10 text-5xl font-black mb-1"
          style={{ color: "#6f63ff" }}
        >
          {resultado.puntaje}%
        </p>
        <p className="relative z-10 text-slate-500 text-sm mb-6">Puntuación obtenida</p>

        {/* Resultados */}
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

        {/* Próximos pasos */}
        <div className="relative z-10 bg-[#f0eeff] rounded-xl p-4 mb-6 text-left">
          <p className="font-bold text-slate-900 mb-2">🎯 Próximos Pasos 🚀</p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Accede a tu dashboard de la subárea</li>
            <li>• Explora SkillPaths recomendados según tu nivel</li>
            <li>• Comienza PathChallenges para aplicar tus conocimientos</li>
            <li>• Agenda entrevistas con PathMentors</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="relative z-10 flex gap-3">
          <button
            onClick={() => router.push("/areas")}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 transition"
          >
            Explorar otras áreas
          </button>
          <button
            onClick={() => router.push(`/areas/${area}/subareas/${idSubarea}/dashboard`)}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition"
            style={{ background: "linear-gradient(135deg, #6f63ff, #c850c0)" }}
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
