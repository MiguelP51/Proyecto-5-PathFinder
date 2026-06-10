import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, FileText, Target, Users } from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { apiFetch } from "@/lib/api";
import AuthenticatedTopBar from "@/components/AuthenticatedTopBar";

const steps = [
  {
    title: "Postulacion",
    description: "Sube tu CV y completa tu informacion personal.",
    icon: FileText,
  },
  {
    title: "Evaluacion DISC",
    description: "Completa una evaluacion de personalidad profesional.",
    icon: Target,
  },
  {
    title: "Entrevista",
    description: "Participa en una entrevista con un PathMentor.",
    icon: Users,
  },
];

const benefits = [
  "Proceso identico al de empresas reales",
  "Retroalimentacion personalizada de expertos",
  "Preparacion para entrevistas reales",
  "Descubre tu perfil DISC profesional",
  "Sin costo y 100% virtual",
];

export default async function SimulationIntroPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  let targetUrl = "/user/profile";
  try {
    const statusData = await apiFetch<any>("/api/users/me/status", {}, session.backendJwt);
    if (statusData) {
      if (!statusData.perfilConfirmado) {
        targetUrl = "/user/profile";
      } else if (statusData.etapas?.TEST_DISC !== "COMPLETADA") {
        targetUrl = "/user/app/disc-intro";
      } else if (statusData.etapas?.AGENDAMIENTO_ENTREVISTA !== "COMPLETADA") {
        targetUrl = "/user/app/simulation-schedule";
      } else {
        targetUrl = "/user/app/simulation-details";
      }
    }
  } catch (err) {
    console.error("Error loading status in server component:", err);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf7ff] via-white to-[#effffd] text-[#081333]">
   

      <main className="mx-auto flex w-full max-w-4xl px-4 py-10 md:py-12">
        <section className="w-full rounded-[18px] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70 md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-white shadow-lg shadow-purple-200">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-normal md:text-4xl">
              Bienvenido al Proceso de Seleccion PathFinder
            </h1>
            <p className="mt-3 text-lg text-slate-600 md:text-xl">
              Vive una experiencia real de seleccion profesional
            </p>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-bold">El proceso consta de 3 etapas:</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-3">
              {steps.map(({ title, description, icon: Icon }) => (
                <article key={title} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[14px] bg-[#F5DDF8] text-[#7447D7]">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-bold">Que obtendras?</h2>
            <ul className="mt-4 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-[14px] border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
            <strong>Importante:</strong> Este es un proceso de seleccion simulado con fines educativos.
            Recibiras retroalimentacion profesional que te ayudara a prepararte para procesos reales.
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href={targetUrl}
              className="inline-flex h-12 min-w-56 items-center justify-center rounded-[8px] bg-gradient-to-r from-[#7447D7] to-[#D43EE6] px-8 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            >
              Comenzar proceso
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
