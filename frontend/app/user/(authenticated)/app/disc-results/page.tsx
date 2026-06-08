"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Award, Brain, Loader2, AlertCircle, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface Resultado {
  idResultadoDisc: number;
  puntajeD: number;
  puntajeI: number;
  puntajeS: number;
  puntajeC: number;
  porcentajeD: number;
  porcentajeI: number;
  porcentajeS: number;
  porcentajeC: number;
  perfilDominante: string;
  nombrePerfil: string;
  descripcion: string;
  fortalezas: string[];
  habilidadesSugeridas: string[];
  fechaFinalizacion: string;
}

export default function DiscResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados
  const [result, setResult] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.backendJwt) {
      loadResult();
    }
  }, [status, session, router]);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch<Resultado>("/api/disc/result", {}, session?.backendJwt);
      setResult(data);
    } catch (err) {
      console.error("Error cargando resultado DISC:", err);
      setError(err instanceof Error ? err.message : "Error cargando tu resultado del test DISC");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#7447D7]" />
          <p className="text-lg font-medium text-slate-600">Procesando tus resultados DISC...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <article className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-6 shadow-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-800">Ups, algo salió mal</h2>
          <p className="mt-2 text-slate-600 leading-relaxed">
            {error || "No se encontraron resultados para tu evaluación psicométrica."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={loadResult}
              className="h-11 rounded-xl bg-[#7447D7] font-bold text-white transition hover:opacity-90 cursor-pointer"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => router.push("/user/home")}
              className="h-11 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 transition hover:border-[#7447D7] hover:text-[#7447D7] cursor-pointer"
            >
              Volver al dashboard
            </button>
          </div>
        </article>
      </div>
    );
  }

  // Preparar datos para Recharts Radar
  const chartData = [
    { subject: "Dominancia (D)", A: result.porcentajeD, fullMark: 100 },
    { subject: "Influencia (I)", A: result.porcentajeI, fullMark: 100 },
    { subject: "Estabilidad (S)", A: result.porcentajeS, fullMark: 100 },
    { subject: "Cumplimiento (C)", A: result.porcentajeC, fullMark: 100 },
  ];

  // Colores temáticos por dimensión dominante
  const getDimensionColor = (dim: string) => {
    switch (dim) {
      case "D": return { name: "Dominancia", bg: "bg-rose-50/70 border-rose-200 text-rose-700", text: "text-rose-700", dot: "bg-rose-500" };
      case "I": return { name: "Influencia", bg: "bg-amber-50/70 border-amber-200 text-amber-700", text: "text-amber-700", dot: "bg-amber-500" };
      case "S": return { name: "Estabilidad", bg: "bg-emerald-50/70 border-emerald-200 text-emerald-700", text: "text-emerald-700", dot: "bg-emerald-500" };
      case "C": return { name: "Cumplimiento", bg: "bg-blue-50/70 border-blue-200 text-blue-700", text: "text-blue-700", dot: "bg-blue-500" };
      default: return { name: "", bg: "bg-slate-50 border-slate-200 text-slate-700", text: "text-slate-700", dot: "bg-slate-500" };
    }
  };

  const dominantColor = getDimensionColor(result.perfilDominante);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf7ff] via-white to-[#effffd] text-[#081333] pb-16">
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        
        {/* Encabezado */}
        <section className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-white shadow-md">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Resultados de tu Perfil DISC</h1>
              <p className="text-sm text-slate-500">Evaluación completada con éxito</p>
            </div>
          </div>
        </section>

        {/* Tarjeta de Perfil Dominante */}
        <section className={`mb-8 rounded-3xl border p-6 md:p-8 shadow-sm ${dominantColor.bg}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider bg-white shadow-sm mb-4 ${dominantColor.text}`}>
                <Star className="h-3.5 w-3.5 fill-current" />
                Estilo Dominante: {result.nombrePerfil}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-normal">
                Perfil de Personalidad Conductual: {result.perfilDominante}
              </h2>
              <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-700">
                {result.descripcion}
              </p>
            </div>
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-md text-4xl font-black text-slate-900 border border-slate-100">
              {result.perfilDominante}
            </div>
          </div>
        </section>

        {/* Distribución y Fortalezas */}
        <section className="grid gap-8 md:grid-cols-2 mb-8">
          
          {/* Radar Chart (Solo renderizado en cliente para evitar hidración) */}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Distribución de Dimensiones</h3>
              <p className="text-sm text-slate-400 mt-1">Comparación porcentual de tus rasgos de comportamiento</p>
            </div>
            <div className="h-[280px] mt-4 flex items-center justify-center">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11, fontWeight: "bold" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Radar
                      name="Porcentaje"
                      dataKey="A"
                      stroke="#7447D7"
                      fill="#7447D7"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-slate-400">Cargando gráfico...</div>
              )}
            </div>
          </article>

          {/* Fortalezas y Habilidades */}
          <article className="space-y-6">
            
            {/* Fortalezas */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Tus Fortalezas Clave</h3>
              <ul className="space-y-3">
                {result.fortalezas.map((fort, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-500 mt-0.5" />
                    <span>{fort}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Habilidades sugeridas */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Rutas y Habilidades Recomendadas</h3>
              <div className="flex flex-wrap gap-2">
                {result.habilidadesSugeridas.map((hab, i) => (
                  <span
                    key={i}
                    className="inline-flex rounded-xl bg-purple-50 border border-purple-100 px-3.5 py-2 text-xs font-bold text-[#7447D7]"
                  >
                    {hab}
                  </span>
                ))}
              </div>
            </div>

          </article>
        </section>

        {/* Desglose de las 4 dimensiones */}
        <section className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Desglose Detallado por Dimensión</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            
            {/* Dominancia */}
            <article className={`rounded-2xl border p-4 text-center ${getDimensionColor("D").bg}`}>
              <span className="text-2xl font-black block">D</span>
              <strong className="text-3xl font-extrabold block mt-1">{result.porcentajeD}%</strong>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mt-1">Dominancia</span>
            </article>

            {/* Influencia */}
            <article className={`rounded-2xl border p-4 text-center ${getDimensionColor("I").bg}`}>
              <span className="text-2xl font-black block">I</span>
              <strong className="text-3xl font-extrabold block mt-1">{result.porcentajeI}%</strong>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mt-1">Influencia</span>
            </article>

            {/* Estabilidad */}
            <article className={`rounded-2xl border p-4 text-center ${getDimensionColor("S").bg}`}>
              <span className="text-2xl font-black block">S</span>
              <strong className="text-3xl font-extrabold block mt-1">{result.porcentajeS}%</strong>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mt-1">Estabilidad</span>
            </article>

            {/* Cumplimiento */}
            <article className={`rounded-2xl border p-4 text-center ${getDimensionColor("C").bg}`}>
              <span className="text-2xl font-black block">C</span>
              <strong className="text-3xl font-extrabold block mt-1">{result.porcentajeC}%</strong>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mt-1">Cumplimiento</span>
            </article>

          </div>
        </section>

        {/* Footer / Continuar */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400 font-medium">
            Evaluación realizada el {new Date(result.fechaFinalizacion).toLocaleDateString()}
          </p>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={() => router.push("/user/app/simulation-intro")}
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-8 text-sm font-bold text-white shadow-md shadow-purple-200/50 transition hover:opacity-90 cursor-pointer"
            >
              Continuar a Entrevistas
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </footer>

      </main>
    </div>
  );
}
