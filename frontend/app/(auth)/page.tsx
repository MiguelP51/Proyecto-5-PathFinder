export const dynamic = "force-dynamic";

import styles from "@/styles/Landpage.module.css";
import Footer from "@/components/Footer";
import SessionOpenNotice from "@/components/SessionOpenNotice";
import Link from "next/link";
import {
    Rocket, UsersRound, Globe2, Award, Zap, ArrowRight, TrendingUp, BriefcaseBusiness,
    Target, Star, Clock3, ShieldCheck, CheckCircle2, Info, HelpCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface PublicStatsDTO {
  totalStudents: number;
  totalAreas: number;
  totalSubareas: number;
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
}

const ICON_MAP: Record<string, any> = {
  "recursos-humanos": UsersRound,
  "marketing": TrendingUp,
  "finanzas": Award,
  "comercial": BriefcaseBusiness,
  "logistica": Target,
};

const STYLE_MAP: Record<string, { card: string; icon: string; button: string }> = {
  "recursos-humanos": { card: styles.areaCardPurple, icon: styles.areaIconPurple, button: styles.areaButtonPurple },
  "marketing": { card: styles.areaCardPink, icon: styles.areaIconPink, button: styles.areaButtonPink },
  "finanzas": { card: styles.areaCardFuchsia, icon: styles.areaIconFuchsia, button: styles.areaButtonFuchsia },
  "comercial": { card: styles.areaCardRed, icon: styles.areaIconRed, button: styles.areaButtonRed },
  "logistica": { card: styles.areaCardOrange, icon: styles.areaIconOrange, button: styles.areaButtonOrange },
};

export default async function Home() {
    const stats = await apiFetch<PublicStatsDTO>("/api/public/exploracion/stats").catch(() => null);
    const areas = await apiFetch<PublicAreaResponseDTO[]>("/api/public/exploracion/areas").catch(() => null);

    const totalStudents = stats?.totalStudents || 500;
    const totalAreas = stats?.totalAreas || 5;
    const totalSubareas = stats?.totalSubareas || 12;

    return (
        <div className={styles.landing}>
            <SessionOpenNotice />
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        <span>Encuentra tu</span>
                        <span className={styles.gradientText}>
                            Primera Experiencia
                        </span>
                        <span>Profesional</span>
                    </h1>

                    <p className={styles.heroDescription}>
                        Explora{" "}
                        <span className={styles.highlightPurple}>
                            {totalAreas} áreas especializadas
                        </span>
                        , desarrolla habilidades clave y prepárate para tu{" "}
                        <span className={styles.highlightPink}>
                            puesto deseado
                        </span>
                    </p>

                    <div className={styles.heroButtons}>
                        <Link href="/areas" className={styles.primaryButton}>
                            <Rocket size={18} strokeWidth={2.4} />
                            <span>Explorar Áreas</span>
                            <ArrowRight size={18} strokeWidth={2.4} />
                        </Link>

                        <Link href="/simulation" className={styles.secondaryButton}>
                            <Zap size={18} strokeWidth={2.4} />
                            <span>Iniciar Simulación</span>
                        </Link>
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.statCard}>
                            <strong className={styles.statPurple}>{totalStudents}+</strong>
                            <span>Practicantes</span>
                        </div>

                        <div className={styles.statCard}>
                            <strong className={styles.statPurpleLight}>{totalAreas}</strong>
                            <span>Áreas</span>
                        </div>

                        <div className={styles.statCard}>
                            <strong className={styles.statPink}>{totalSubareas}</strong>
                            <span>Subáreas</span>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.areasSection}>
                <h2 className={styles.areasTitle}>
                    Descubre el área que{" "}
                    <span>impulse tu carrera</span>
                </h2>

                <p className={styles.areasDescription}>
                    Cada área está diseñada para desarrollar competencias específicas del mercado laboral
                </p>

                <div className={styles.areasGrid}>
                    {areas && areas.length > 0 ? (
                        areas.map((area) => {
                            const Icon = ICON_MAP[area.idArea] || HelpCircle;
                            const classes = STYLE_MAP[area.idArea] || {
                                card: styles.areaCardPurple,
                                icon: styles.areaIconPurple,
                                button: styles.areaButtonPurple
                            };

                            return (
                                <article key={area.idArea} className={`${styles.areaCard} ${classes.card}`}>
                                    <div className={`${styles.areaIconBox} ${classes.icon}`}>
                                        <Icon size={34} strokeWidth={2.2} />
                                    </div>

                                    <h3>{area.nombre}</h3>
                                    <p>{area.descripcion}</p>

                                    <Link
                                        href={`/areas/${area.idArea}`}
                                        className={`${styles.areaButton} ${classes.button}`}
                                    >
                                        Explorar
                                    </Link>
                                </article>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            No hay áreas de especialización disponibles en este momento.
                        </div>
                    )}
                </div>

                <Link href="/areas" className={styles.viewAllAreasButton}>
                    <span>Ver todas las áreas en detalle</span>
                    <ArrowRight size={18} strokeWidth={2.4} />
                </Link>

            </section>

            <section className={styles.stepsSection}>
                <h2 className={styles.stepsTitle}>
                    Tu camino hacia el{" "}
                    <span>éxito en 4 pasos</span>
                </h2>

                <div className={styles.stepsGrid}>
                    <article className={styles.stepCard}>
                        <div className={styles.stepIconWrapper}>
                            <div className={`${styles.stepIconBox} ${styles.stepIconPurple}`}>
                                <UsersRound size={34} strokeWidth={2.2} />
                            </div>
                            <span className={styles.stepNumber}>01</span>
                        </div>

                        <h3>Regístrate</h3>
                        <p>Crea tu perfil y completa tu información académica</p>
                    </article>

                    <article className={styles.stepCard}>
                        <div className={styles.stepIconWrapper}>
                            <div className={`${styles.stepIconBox} ${styles.stepIconPink}`}>
                                <Target size={34} strokeWidth={2.2} />
                            </div>
                            <span className={styles.stepNumber}>02</span>
                        </div>

                        <h3>Elige tu área</h3>
                        <p>Selecciona el área que más se alinee con tus intereses</p>
                    </article>

                    <article className={styles.stepCard}>
                        <div className={styles.stepIconWrapper}>
                            <div className={`${styles.stepIconBox} ${styles.stepIconFuchsia}`}>
                                <Zap size={34} strokeWidth={2.2} />
                            </div>
                            <span className={styles.stepNumber}>03</span>
                        </div>

                        <h3>Completa la simulación</h3>
                        <p>Vive un proceso de selección real y demuestra tu potencial</p>
                    </article>

                    <article className={styles.stepCard}>
                        <div className={styles.stepIconWrapper}>
                            <div className={`${styles.stepIconBox} ${styles.stepIconOrange}`}>
                                <Rocket size={34} strokeWidth={2.2} />
                            </div>
                            <span className={styles.stepNumber}>04</span>
                        </div>

                        <h3>Comienza tu práctica</h3>
                        <p>Inicia tu experiencia profesional en empresas top</p>
                    </article>
                </div>
            </section>

            <section className={styles.testimonialsSection}>
                <h2 className={styles.testimonialsTitle}>
                    Lo que dicen nuestros{" "}
                    <span>practicantes</span>
                </h2>

                <div className={styles.testimonialsGrid}>
                    <article className={styles.testimonialCard}>
                        <div className={styles.testimonialHeader}>
                            <div className={styles.avatar}>MG</div>

                            <div>
                                <h3>María González</h3>
                                <p>Practicante de Marketing</p>
                            </div>
                        </div>

                        <div className={styles.stars}>
                            {[...Array(5)].map((_, index) => (
                                <Star key={index} size={18} fill="currentColor" />
                            ))}
                        </div>

                        <p className={styles.testimonialText}>
                            "PathFinder me ayudó a conseguir mi primera práctica profesional.
                            El proceso fue claro y el apoyo constante."
                        </p>
                    </article>

                    <article className={styles.testimonialCard}>
                        <div className={styles.testimonialHeader}>
                            <div className={styles.avatar}>CR</div>

                            <div>
                                <h3>Carlos Ruiz</h3>
                                <p>Practicante de Finanzas</p>
                            </div>
                        </div>

                        <div className={styles.stars}>
                            {[...Array(5)].map((_, index) => (
                                <Star key={index} size={18} fill="currentColor" />
                            ))}
                        </div>

                        <p className={styles.testimonialText}>
                            "La experiencia fue increíble. Aprendí más en 3 meses que en todo
                            un año académico."
                        </p>
                    </article>

                    <article className={styles.testimonialCard}>
                        <div className={styles.testimonialHeader}>
                            <div className={styles.avatar}>AT</div>

                            <div>
                                <h3>Ana Torres</h3>
                                <p>Practicante de RRHH</p>
                            </div>
                        </div>

                        <div className={styles.stars}>
                            {[...Array(5)].map((_, index) => (
                                <Star key={index} size={18} fill="currentColor" />
                            ))}
                        </div>

                        <p className={styles.testimonialText}>
                            "El programa superó todas mis expectativas. Ahora trabajo full-time
                            en la misma empresa."
                        </p>
                    </article>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className={styles.ctaBox}>
                    <div className={styles.ctaTopBadges}>
                        <div className={styles.ctaBadge}>
                            <Clock3 size={15} strokeWidth={2.4} />
                            <span>24/7</span>
                        </div>

                        <div className={styles.ctaBadge}>
                            <ShieldCheck size={15} strokeWidth={2.4} />
                            <span>100% Seguro</span>
                        </div>
                    </div>

                    <h2 className={styles.ctaTitle}>
                        ¿Listo para comenzar tu experiencia profesional?
                    </h2>

                    <p className={styles.ctaDescription}>
                        Únete a <strong>{totalStudents}+ practicantes</strong> que ya están transformando
                        su futuro con <strong>PathFinder</strong>
                    </p>

                    <div className={styles.ctaButtons}>
                        <Link href="/simulation" className={styles.ctaPrimaryButton}>
                            <Rocket size={18} strokeWidth={2.4} />
                            <span>Comenzar Simulación</span>
                            <ArrowRight size={18} strokeWidth={2.4} />
                        </Link>

                        <Link href="/contact" className={styles.ctaSecondaryButton}>
                            <Info size={18} strokeWidth={2.4} />
                            <span>Más Información</span>
                        </Link>
                    </div>

                    <div className={styles.ctaFeatures}>
                        <span>
                            <CheckCircle2 size={16} strokeWidth={2.4} />
                            Registro gratuito
                        </span>

                        <span>
                            <CheckCircle2 size={16} strokeWidth={2.4} />
                            Sin experiencia previa
                        </span>

                        <span>
                            <CheckCircle2 size={16} strokeWidth={2.4} />
                            Mentores dedicados
                        </span>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
