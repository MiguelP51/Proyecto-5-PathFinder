export const dynamic = "force-dynamic";

import Link from "next/link";
import styles from "@/styles/Areas.module.css";
import type { CSSProperties } from "react";
import {
  UsersRound,
  TrendingUp,
  Award,
  BriefcaseBusiness,
  Target,
  CheckCircle2,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface PublicSubAreaResponseDTO {
  idSubarea: number;
  nombre: string;
  emoji: string;
  descripcion: string;
  nivel: string;
  cantidadSkillPaths: number;
  cantidadPathChallenges: number;
  plataformasSkillPath: string;
  slug: string;
}

interface PublicAreaResponseDTO {
  idArea: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  imagenUrl: string;
  tagline: string;
  funciones: string;
  colorFrom: string;
  colorTo: string;
  subareas: PublicSubAreaResponseDTO[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  "recursos-humanos": UsersRound,
  "marketing": TrendingUp,
  "finanzas": Award,
  "comercial": BriefcaseBusiness,
  "logistica": Target,
};

function AreaDetail({
  area,
  reverse = false,
}: {
  area: PublicAreaResponseDTO;
  reverse?: boolean;
}) {
  const Icon = ICON_MAP[area.idArea] || HelpCircle;

  const colorFrom = area.colorFrom || "#6f63ff";
  const colorTo = area.colorTo || "#8f4df0";

  const areaStyle = {
    "--area-from": colorFrom,
    "--area-to": colorTo,
  } as CSSProperties;

  const imageUrl = area.imagenUrl
    ? (area.imagenUrl.startsWith("areas/")
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/areas/${area.idArea}/imagen`
      : area.imagenUrl)
    : "/areas/placeholder.jpg";

  // Parse functions from DB: format is "Title: Description | Title: Description"
  const parseFunctions = (funcsStr: string) => {
    if (!funcsStr) return [];
    return funcsStr.split("|").map((f) => {
      const parts = f.split(":");
      return {
        title: parts[0]?.trim() || "",
        description: parts[1]?.trim() || "",
      };
    }).filter(f => f.title);
  };

  const functionsList = parseFunctions(area.funciones);

  // Calculate totals from subareas
  const totalSkillPaths = area.subareas?.reduce((acc, sa) => acc + (sa.cantidadSkillPaths || 0), 0) || 0;
  const totalChallenges = area.subareas?.reduce((acc, sa) => acc + (sa.cantidadPathChallenges || 0), 0) || 0;

  return (
    <section
      id={area.idArea}
      className={styles.areaDetailSection}
      style={areaStyle}
    >
      <div
        className={`${styles.areaDetailGrid} ${reverse ? styles.areaDetailGridReverse : ""
          }`}
      >
        <div className={styles.areaImageWrapper}>
          <img src={imageUrl} alt={area.nombre} className={styles.areaImage} />
        </div>

        <div className={styles.areaInfo}>
          <div className={styles.areaTitleRow}>
            <div className={styles.areaIconBox}>
              <Icon size={30} strokeWidth={2.4} />
            </div>

            <h2 className={styles.areaTitle}>{area.nombre}</h2>
          </div>

          <div className={styles.areaDescriptionBox}>
            <p>
              <span className={styles.descriptionLabel}>
                Descripción General:
              </span>{" "}
              {area.descripcion}
            </p>
          </div>

          {/* Counts statistics badge */}
          <div className="flex gap-4 mt-2 mb-4 text-xs font-semibold text-slate-500">
            <span className="bg-slate-100 rounded-full px-3 py-1">
              {area.subareas?.length || 0} Subáreas
            </span>
            <span className="bg-slate-100 rounded-full px-3 py-1">
              {totalSkillPaths} SkillPaths
            </span>
            <span className="bg-slate-100 rounded-full px-3 py-1">
              {totalChallenges} Retos
            </span>
          </div>

          {functionsList.length > 0 && (
            <>
              <h3 className={styles.functionsTitle}>Funciones Específicas:</h3>
              <div className={styles.functionsList}>
                {functionsList.map((item) => (
                  <article className={styles.functionCard} key={item.title}>
                    <div className={styles.functionIcon}>
                      <CheckCircle2 size={16} strokeWidth={2.6} />
                    </div>

                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          <Link
            href={`/areas/${area.idArea}`}
            style={{
              background:
                "linear-gradient(135deg, var(--area-from), var(--area-to))",
            }}
            className="inline-flex items-center gap-2 mt-6 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90"
          >
            Explorar {area.nombre}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function AreasPage() {
  const areas = await apiFetch<PublicAreaResponseDTO[]>("/api/public/exploracion/areas").catch(() => []);

  return (
    <main className={styles.areasPage}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>

          <h1 className={styles.heroTitle}>
            Descubre tu área <span className={styles.gradientText}>de</span>
            <br />
            <span className={styles.gradientText}>especialización</span>
          </h1>

          <p className={styles.heroDescription}>
            Explora las diferentes áreas profesionales disponibles en nuestro
            programa y encuentra la que mejor se adapte a tus intereses y
            objetivos de carrera.
          </p>
        </div>
      </section>

      {areas && areas.length > 0 ? (
        areas.map((area, index) => (
          <AreaDetail key={area.idArea} area={area} reverse={index % 2 !== 0} />
        ))
      ) : (
        <div className="text-center py-20 text-slate-500">
          No hay áreas disponibles configuradas en el sistema.
        </div>
      )}
    </main>
  );
}
