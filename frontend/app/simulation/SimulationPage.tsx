import {
    ArrowRight,
    BriefcaseBusiness,
    ClipboardCheck,
    MessageSquareText,
    Star,
    TrendingUp,
} from "lucide-react";
import Footer from "@/components/Footer";
import styles from "../../styles/Simulation.module.css";

const processSteps = [
    {
        id: 1,
        title: "Postulación",
        description: "Sube tu CV y responde una pregunta motivadora para comenzar",
        icon: ClipboardCheck,
    },
    {
        id: 2,
        title: "Evaluación DISC",
        description: "Completa una prueba psicométrica para conocer tu perfil",
        icon: MessageSquareText,
    },
    {
        id: 3,
        title: "Entrevista",
        description: "Agenda tu entrevista virtual o presencial con el equipo",
        icon: BriefcaseBusiness,
    },
];

const simulationBenefits = [
    "Simulación de proceso real de selección",
    "Retroalimentación personalizada",
    "Práctica con el método STAR",
    "Descubre tu perfil DISC",
];

export default function SimulationPage() {
    return (
        <div className={styles.simulationPage}>
            <section className={styles.heroSection}>
                <div className={styles.heroInner}>
                    <div className={styles.heroContent}>
                        <span className={styles.heroBadge}>Simulación de proceso de selección real</span>

                        <h1 className={styles.heroTitle}>
                            Conquista tu próximo{" "}
                            <span className={styles.highlightText}>proceso de selección</span>
                        </h1>

                        <p className={styles.heroDescription}>
                            Practica con nuestro proceso simulado y prepárate para brillar en tu próxima
                            oportunidad profesional.
                        </p>

                        <div className={styles.heroActions}>
                            <button type="button" className={styles.primaryButton}>
                                Comenzar simulación
                                <ArrowRight size={16} />
                            </button>
                            <button type="button" className={styles.secondaryButton}>
                                Conocer más
                            </button>
                        </div>

                        <div className={styles.statsGrid}>
                            <article className={styles.statCard}>
                                <TrendingUp size={16} />
                                <strong>500+</strong>
                                <span>Usuarios activos</span>
                            </article>
                            <article className={styles.statCard}>
                                <TrendingUp size={16} />
                                <strong>98%</strong>
                                <span>Tasa de éxito</span>
                            </article>
                            <article className={styles.statCard}>
                                <Star size={16} />
                                <strong>4.9</strong>
                                <span>Calificación</span>
                            </article>
                        </div>
                    </div>

                    <div className={styles.heroImageWrap}>
                        <img
                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
                            alt="Equipo en entrevista laboral"
                            className={styles.heroImage}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.stepsSection}>
                <span className={styles.sectionLabel}>Proceso simple de 3 pasos</span>
                <h2 className={styles.sectionTitle}>
                    Tu camino hacia el <span>éxito profesional</span>
                </h2>
                <p className={styles.sectionSubtitle}>
                    Un proceso completo diseñado para prepararte y darte confianza.
                </p>

                <div className={styles.stepsGrid}>
                    {processSteps.map(({ id, title, description, icon: Icon }) => (
                        <article key={title} className={styles.stepCard}>
                            <div className={styles.stepIconWrap}>
                                <span className={styles.stepIcon}>
                                    <Icon size={24} />
                                </span>
                                <span className={styles.stepNumber}>{id}</span>
                            </div>
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className={styles.experienceSection}>
                <div className={styles.experienceImageWrap}>
                    <img
                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80"
                        alt="Entrevista de trabajo"
                        className={styles.experienceImage}
                    />
                </div>

                <div className={styles.experienceContent}>
                    <span className={styles.sectionLabel}>¿Qué ofrecemos?</span>
                    <h2 className={styles.sectionTitleLeft}>
                        Una experiencia <span>auténtica</span> de selección
                    </h2>
                    <p className={styles.experienceDescription}>
                        Vive un proceso de selección como si fuera real. Postula, completa evaluaciones
                        psicométricas y participa en entrevistas profesionales.
                    </p>

                    <div className={styles.purposeBox}>
                        <strong>Nuestro propósito:</strong> ayudarte a descubrir tu estilo, tu voz y tu
                        potencial para que llegues preparado a tu próxima oportunidad.
                    </div>

                    <ul className={styles.benefitsList}>
                        {simulationBenefits.map((benefit) => (
                            <li key={benefit}>{benefit}</li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className={styles.ctaBox}>
                    <h2>¿Listo para dar el siguiente paso?</h2>
                    <p>
                        Comienza tu simulación ahora y descubre tu potencial con <strong>PathFinder</strong>
                    </p>
                    <button type="button" className={styles.ctaButton}>
                        Comenzar ahora
                        <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
