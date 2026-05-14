import styles from "../../styles/Landpage.module.css";
import Footer from "../../components/Footer";
import Link from "next/link";
import { Rocket, UsersRound, Globe2, Award, Zap, ArrowRight, TrendingUp, BriefcaseBusiness,
    Target, Star, Clock3, ShieldCheck, CheckCircle2, Info } from "lucide-react";

export default function Home() {
    return (
        <div className={styles.landing}>
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
              5 áreas especializadas
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
                            <strong className={styles.statPurple}>500+</strong>
                            <span>Practicantes</span>
                        </div>

                        <div className={styles.statCard}>
                            <strong className={styles.statPurpleLight}>5</strong>
                            <span>Áreas</span>
                        </div>

                        <div className={styles.statCard}>
                            <strong className={styles.statPink}>95%</strong>
                            <span>Inserción</span>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.benefitsSection}>

                <h2 className={styles.benefitsTitle}>
                    ¿Por qué elegirnos para tu{" "}
                    <span>primera experiencia?</span>
                </h2>

                <p className={styles.benefitsDescription}>
                    Ofrecemos más que una práctica, te brindamos una experiencia transformadora
                </p>

                <div className={styles.benefitsGrid}>
                    <article className={`${styles.benefitCard} ${styles.benefitCardPurple}`}>
                        <div className={`${styles.benefitIconBox} ${styles.iconRocket}`}>
                            <Rocket size={28} strokeWidth={2.4} />
                        </div>

                        <h3>Experiencia Real</h3>
                        <p>
                            Trabaja en proyectos reales con impacto directo en organizaciones
                        </p>
                    </article>

                    <article className={`${styles.benefitCard} ${styles.benefitCardPink}`}>
                        <div className={`${styles.benefitIconBox} ${styles.iconUsers}`}>
                            <UsersRound size={28} strokeWidth={2.4} />
                        </div>

                        <h3>Mentores Expertos</h3>
                        <p>
                            Aprende de profesionales con años de experiencia en el sector
                        </p>
                    </article>

                    <article className={`${styles.benefitCard} ${styles.benefitCardFuchsia}`}>
                        <div className={`${styles.benefitIconBox} ${styles.iconGlobe}`}>
                            <Globe2 size={28} strokeWidth={2.4} />
                        </div>

                        <h3>Red de Contactos</h3>
                        <p>
                            Conecta con empresas líderes y amplía tu networking profesional
                        </p>
                    </article>

                    <article className={`${styles.benefitCard} ${styles.benefitCardOrange}`}>
                        <div className={`${styles.benefitIconBox} ${styles.iconAward}`}>
                            <Award size={28} strokeWidth={2.4} />
                        </div>

                        <h3>Certificación</h3>
                        <p>
                            Obtén reconocimiento oficial que impulse tu carrera profesional
                        </p>
                    </article>
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
                    <article className={`${styles.areaCard} ${styles.areaCardPurple}`}>
                        <div className={`${styles.areaIconBox} ${styles.areaIconPurple}`}>
                            <UsersRound size={34} strokeWidth={2.2} />
                        </div>

                        <h3>Recursos Humanos</h3>
                        <p>
                            Gestiona el talento y crea ambientes laborales excepcionales
                        </p>

                        <Link
                            href="/areas#recursos-humanos"
                            className={`${styles.areaButton} ${styles.areaButtonPurple}`}
                        >
                            Explorar
                        </Link>
                    </article>

                    <article className={`${styles.areaCard} ${styles.areaCardPink}`}>
                        <div className={`${styles.areaIconBox} ${styles.areaIconPink}`}>
                            <TrendingUp size={34} strokeWidth={2.2} />
                        </div>

                        <h3>Marketing</h3>
                        <p>
                            Crea estrategias que impulsen el crecimiento de marcas
                        </p>

                        <Link
                            href="/areas#marketing"
                            className={`${styles.areaButton} ${styles.areaButtonPink}`}
                        >
                            Explorar
                        </Link>
                    </article>

                    <article className={`${styles.areaCard} ${styles.areaCardFuchsia}`}>
                        <div className={`${styles.areaIconBox} ${styles.areaIconFuchsia}`}>
                            <Award size={34} strokeWidth={2.2} />
                        </div>

                        <h3>Finanzas</h3>
                        <p>
                            Administra recursos y asegura la estabilidad financiera
                        </p>

                        <Link
                            href="/areas#finanzas"
                            className={`${styles.areaButton} ${styles.areaButtonFuchsia}`}
                        >
                            Explorar
                        </Link>
                    </article>

                    <article className={`${styles.areaCard} ${styles.areaCardRed}`}>
                        <div className={`${styles.areaIconBox} ${styles.areaIconRed}`}>
                            <BriefcaseBusiness size={34} strokeWidth={2.2} />
                        </div>

                        <h3>Comercial</h3>
                        <p>
                            Lidera ventas y relaciones estratégicas con clientes
                        </p>

                        <Link
                            href="/areas#comercial"
                            className={`${styles.areaButton} ${styles.areaButtonRed}`}
                        >
                            Explorar
                        </Link>
                    </article>

                    <article className={`${styles.areaCard} ${styles.areaCardOrange}`}>
                        <div className={`${styles.areaIconBox} ${styles.areaIconOrange}`}>
                            <Target size={34} strokeWidth={2.2} />
                        </div>

                        <h3>Logística</h3>
                        <p>
                            Optimiza la cadena de suministro y distribución
                        </p>

                        <Link
                            href="/areas#logistica"
                            className={`${styles.areaButton} ${styles.areaButtonOrange}`}
                        >
                            Explorar
                        </Link>
                    </article>
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
                        Únete a <strong>500+ practicantes</strong> que ya están transformando
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