import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  Clock,
  Heart,
  Info,
  Shield,
  Target,
  Users,
  Wifi,
} from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AuthenticatedTopBar from "@/components/AuthenticatedTopBar";

const dimensions = [
  {
    letter: "D",
    title: "Dominancia",
    description: "Orientacion a resultados, toma de decisiones directa",
    className: "bg-red-100 text-red-600",
  },
  {
    letter: "I",
    title: "Influencia",
    description: "Comunicacion persuasiva, entusiasmo y optimismo",
    className: "bg-yellow-100 text-yellow-600",
  },
  {
    letter: "S",
    title: "Estabilidad",
    description: "Colaboracion, paciencia y trabajo en equipo",
    className: "bg-emerald-100 text-emerald-600",
  },
  {
    letter: "C",
    title: "Cumplimiento",
    description: "Precision, analisis y atencion al detalle",
    className: "bg-blue-100 text-blue-600",
  },
];

const recommendations = [
  { label: "Responder con honestidad", icon: Heart },
  { label: "Responder con naturalidad", icon: Users },
  { label: "Completar sin interrupciones", icon: Clock },
  { label: "Verificar estabilidad de conexion", icon: Wifi },
];

const facts = [
  { value: "20", label: "Preguntas", icon: Target, className: "text-[#B412F0]" },
  { value: "15 min", label: "Tiempo estimado", icon: Clock, className: "text-blue-600" },
  { value: "100%", label: "Confidencial", icon: CheckCircle2, className: "text-emerald-600" },
];

export default async function DiscIntroPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  let perfilConfirmado = false;
  let testCompletado = false;

  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/users/me/status`, {
      headers: {
        Authorization: `Bearer ${(session as any).backendJwt}`,
      },
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const json = await res.json();
      const statusData = json.data || json;
      perfilConfirmado = statusData?.perfilConfirmado || false;
      const testStatus = statusData?.etapas?.TEST_DISC;
      testCompletado = testStatus === "COMPLETADA";
    }
  } catch (err) {
    console.error("Error verificando estado del estudiante en disc-intro:", err);
  }

  if (!perfilConfirmado) {
    redirect("/user/profile?error=need_confirm");
  }

  if (testCompletado) {
    redirect("/user/app/disc-results");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf7ff] via-white to-[#effffd] text-[#081333]">
  

      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-12">
        <section className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-white shadow-lg shadow-purple-200">
            <Brain className="h-10 w-10" />
          </div>
          <span className="mt-6 inline-flex rounded-full bg-[#7447D7] px-3 py-1 text-xs font-bold text-white">
            Etapa 2
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-normal md:text-4xl">
            Prueba Psicometrica DISC
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
            Descubre tu perfil profesional mediante una evaluacion de personalidad validada cientificamente
          </p>
        </section>

        <section className="mt-9 rounded-[14px] border border-blue-200 bg-blue-50 p-6 text-blue-950">
          <div className="flex gap-4">
            <Info className="mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold">No existen respuestas correctas o incorrectas</h2>
              <p className="mt-3 leading-7">
                Esta evaluacion busca identificar tu estilo natural de comportamiento y comunicacion.
                Responde segun tu forma habitual de actuar, no segun lo que crees que deberias responder.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[14px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold">Dimensiones DISC</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {dimensions.map((dimension) => (
              <article key={dimension.letter} className="flex gap-4 rounded-[10px] border border-slate-200 p-4">
                <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[10px] text-2xl font-extrabold ${dimension.className}`}>
                  {dimension.letter}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{dimension.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{dimension.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[14px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold">Recomendaciones</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {recommendations.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-[10px] border border-purple-200 bg-purple-50/70 p-4 text-slate-700">
                <Icon className="h-5 w-5 flex-shrink-0 text-[#7447D7]" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[14px] border border-slate-200 bg-slate-50 p-6">
          <div className="flex gap-4">
            <Shield className="mt-1 h-6 w-6 flex-shrink-0 text-slate-600" />
            <div>
              <h2 className="text-lg font-bold">Disponibilidad de la evaluacion</h2>
              <p className="mt-2 leading-7 text-slate-600">
                La evaluacion DISC podra volver a realizarse despues del periodo definido por la plataforma.
                Tus resultados quedaran guardados en tu perfil.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {facts.map(({ value, label, icon: Icon, className }) => (
            <article key={label} className="rounded-[14px] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <Icon className={`mx-auto h-8 w-8 ${className}`} />
              <strong className={`mt-3 block text-3xl font-extrabold ${className}`}>{value}</strong>
              <span className="text-sm text-slate-600">{label}</span>
            </article>
          ))}
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/user/app/disc-test"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-6 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Brain className="h-4 w-4" />
            Iniciar prueba
          </Link>
          <Link
            href="/?session=active"
            className="inline-flex h-12 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 transition hover:border-[#7447D7] hover:text-[#7447D7]"
          >
            Volver al dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
