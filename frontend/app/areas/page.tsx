import styles from "../../styles/Areas.module.css";
import type { CSSProperties } from "react";
import {
    UsersRound,
    TrendingUp,
    Award,
    BriefcaseBusiness,
    Target,
    CheckCircle2,
    type LucideIcon,
} from "lucide-react";

type AreaItem = {
    title: string;
    description: string;
    image: string;
    Icon: LucideIcon;
    colorFrom: string;
    colorTo: string;
    functions: {
        title: string;
        description: string;
    }[];
};

type AreaStyle = CSSProperties & {
    "--area-from": string;
    "--area-to": string;
};

const areas: AreaItem[] = [
    {
        title: "Recursos Humanos",
        description:
            "Gestionan el talento humano, asegurando un ambiente laboral óptimo y el cumplimiento de políticas internas.",
        image: "/areas/rrhh.jpg",
        Icon: UsersRound,
        colorFrom: "#6f63ff",
        colorTo: "#8f4df0",
        functions: [
            {
                title: "Reclutamiento y selección",
                description:
                    "Encargada de atraer, evaluar y contratar a los mejores candidatos.",
            },
            {
                title: "Capacitación y desarrollo",
                description:
                    "Diseña programas de formación y crecimiento profesional.",
            },
            {
                title: "Compensación y beneficios",
                description:
                    "Administra salarios, incentivos y prestaciones laborales.",
            },
            {
                title: "Bienestar y clima organizacional",
                description:
                    "Promueve un entorno laboral saludable y motivador.",
            },
        ],
    },
    {
        title: "Marketing",
        description:
            "Se encarga de crear, comunicar y entregar valor a los clientes, gestionando la marca y promoviendo productos o servicios para impulsar el crecimiento.",
        image: "/areas/marketing.jpg",
        Icon: TrendingUp,
        colorFrom: "#ba42dc",
        colorTo: "#ef4bc8",
        functions: [
            {
                title: "Investigación de mercados",
                description:
                    "Analiza tendencias, competencia y comportamiento del consumidor para identificar oportunidades.",
            },
            {
                title: "Marketing digital",
                description:
                    "Desarrolla estrategias online, incluyendo SEO, SEM, redes sociales y campañas de correo electrónico.",
            },
            {
                title: "Gestión de marca (Branding)",
                description:
                    "Define la identidad, la voz y el posicionamiento de la marca en el mercado.",
            },
            {
                title: "Comunicaciones y PR",
                description:
                    "Coordina los mensajes internos y externos, y gestiona la relación con los medios.",
            },
        ],
    },
    {
        title: "Finanzas",
        description:
            "Administra los recursos económicos de la empresa, asegurando la liquidez, rentabilidad y estabilidad financiera para apoyar la toma de decisiones estratégicas",
        image: "/areas/finanzas.jpg",
        Icon: Award,
        colorFrom: "#f73586",
        colorTo: "#f2186c",
        functions: [
            {
                title: "Contabilidad",
                description:
                    "Registra y reporta las transacciones financieras para generar estados contables precisos.",
            },
            {
                title: "Planificación y análisis financiero (FP&A)",
                description:
                    "Elabora presupuestos, pronósticos y modelos financieros para evaluar el desempeño.",
            },
            {
                title: "Tesorería y flujo de caja",
                description:
                    "Gestiona el capital de trabajo, las inversiones y el manejo diario de efectivo.",
            },
            {
                title: "Auditoría y control interno",
                description:
                    "Revisa procesos para asegurar el cumplimiento de regulaciones y la protección de activos.",
            },
        ],
    },
    {
        title: "Comercial",
        description:
            "Lidera las actividades de ventas y la gestión de la relación con los clientes, impulsando los ingresos y expandiendo la cuota de mercado de la empresa.",
        image: "/areas/comercial.jpg",
        Icon: BriefcaseBusiness,
        colorFrom: "#ff3f6e",
        colorTo: "#ff4438",
        functions: [
            {
                title: "Gestión de ventas (Sales Management)",
                description:
                    "Establece objetivos, estrategias de venta y capacita al equipo comercial.",
            },
            {
                title: "Key Account Management (KAM)",
                description:
                    "Desarrolla y mantiene relaciones con los clientes más importantes y estratégicos.",
            },
            {
                title: "Desarrollo de negocios",
                description:
                    "Identifica nuevos mercados, alianzas y oportunidades para la expansión de la oferta.",
            },
            {
                title: "Atención al cliente (Customer Service)",
                description:
                    "Asegura la satisfacción del cliente y maneja consultas o problemas post-venta.",
            },
        ],
    },
    {
        title: "Logística",
        description:
            "Planifica, implementa y controla el flujo eficiente y efectivo de bienes, servicios e información desde el punto de origen hasta el punto de consumo.",
        image: "/areas/logistica.jpg",
        Icon: Target,
        colorFrom: "#ff6a00",
        colorTo: "#f7931e",
        functions: [
            {
                title: "Gestión de almacenes e inventarios",
                description:
                    "Controla el stock, optimiza el espacio de almacenamiento y garantiza la disponibilidad de productos.",
            },
            {
                title: "Transporte y distribución",
                description:
                    "Coordina el movimiento físico de mercancías y selecciona las rutas y medios de transporte más eficientes.",
            },
            {
                title: "Cadena de suministro (Supply Chain)",
                description:
                    "Administra la relación con proveedores y garantiza el flujo continuo de materiales.",
            },
            {
                title: "Operaciones y procesos",
                description:
                    "Diseña y mejora la eficiencia de los procedimientos operativos dentro de la bodega y la distribución.",
            },
        ],
    },
];

function AreaDetail({
                        area,
                        reverse = false,
                    }: {
    area: AreaItem;
    reverse?: boolean;
}) {
    const Icon = area.Icon;

    const areaStyle: AreaStyle = {
        "--area-from": area.colorFrom,
        "--area-to": area.colorTo,
    };

    return (
        <section className={styles.areaDetailSection} style={areaStyle}>
            <div
                className={`${styles.areaDetailGrid} ${
                    reverse ? styles.areaDetailGridReverse : ""
                }`}
            >
                <div className={styles.areaImageWrapper}>
                    <img src={area.image} alt={area.title} className={styles.areaImage} />
                </div>

                <div className={styles.areaInfo}>
                    <div className={styles.areaTitleRow}>
                        <div className={styles.areaIconBox}>
                            <Icon size={30} strokeWidth={2.4} />
                        </div>

                        <h2 className={styles.areaTitle}>{area.title}</h2>
                    </div>

                    <div className={styles.areaDescriptionBox}>
                        <p>
              <span className={styles.descriptionLabel}>
                Descripción General:
              </span>{" "}
                            {area.description}
                        </p>
                    </div>

                    <h3 className={styles.functionsTitle}>Funciones Específicas:</h3>

                    <div className={styles.functionsList}>
                        {area.functions.map((item) => (
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
                </div>
            </div>
        </section>
    );
}

export default function AreasPage() {
    return (
        <main className={styles.areasPage}>
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>5 Áreas de Especialización</div>

                    <h1 className={styles.heroTitle}>
                        Descubre tu área{" "}
                        <span className={styles.gradientText}>de</span>
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

            {areas.map((area, index) => (
                <AreaDetail
                    key={area.title}
                    area={area}
                    reverse={index % 2 !== 0}
                />
            ))}
        </main>
    );
}