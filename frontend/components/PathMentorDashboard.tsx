'use client';

import PathMentorNavbar from './PathMentorNavbar';
import PathMentorTopbar from './PathMentorTopbar';
import { useRouter } from 'next/navigation';
import styles from '../styles/PathMentorDashboard.module.css';

export default function PathMentorDashboard() {

  const router = useRouter();
    return (

        <div className={styles.page}>

            {/* SIDEBAR */}
            <PathMentorNavbar />

            {/* TOPBAR */}
            <PathMentorTopbar />

            {/* CONTENT */}
            <main className={styles.container}>

                {/* HEADER */}
                <div className={styles.header}>

                    <h1>¡Bienvenido de vuelta!</h1>

                    <p>
                        Gestiona tus entrevistas y evaluaciones
                    </p>

                </div>

                {/* METRICS */}
                <section className={styles.metricsGrid}>

                    <div className={styles.metricCard}>

                        <div className={styles.metricIconBlue}>
                            📅
                        </div>

                        <h2>24</h2>

                        <p>Entrevistas del Mes</p>

                        <span>+4 vs mes anterior</span>

                    </div>

                    <div className={styles.metricCard}>

                        <div className={styles.metricIconPurple}>
                            🕒
                        </div>

                        <h2>6</h2>

                        <p>Próximas esta Semana</p>

                        <span>2 hoy</span>

                    </div>

                    <div className={styles.metricCard}>

                        <div className={styles.metricIconGreen}>
                            👥
                        </div>

                        <h2>87</h2>

                        <p>Estudiantes Evaluados</p>

                        <span>Total histórico</span>

                    </div>

                    <div className={styles.metricCard}>

                        <div className={styles.metricIconYellow}>
                            ⭐
                        </div>

                        <h2>4.8</h2>

                        <p>Calificación Promedio</p>

                        <span>★★★★★</span>

                    </div>

                </section>

                {/* BOTTOM GRID */}
                <section className={styles.bottomGrid}>

                    {/* LEFT */}
                    <div className={styles.interviewsCard}>

                        <div className={styles.cardHeader}>

                            <h2>
                                📅 Próximas Entrevistas
                            </h2>

                            <button>
                                Ver Todas
                            </button>

                        </div>

                        <p className={styles.cardSubtitle}>
                            Entrevistas programadas para los próximos días
                        </p>

                        {/* INTERVIEW ITEM */}
                        <div className={styles.interviewItem}>

                            <div>

                                <h3>María González</h3>

                                <span>
                                    2026-05-30 • 10:00
                                </span>

                            </div>

                            <div className={styles.virtualBadge}>
                                🎥 Virtual
                            </div>

                        </div>

                        <div className={styles.interviewItem}>

                            <div>

                                <h3>Carlos Pérez</h3>

                                <span>
                                    2026-05-30 • 14:00
                                </span>

                            </div>

                            <div className={styles.presentialBadge}>
                                Presencial
                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className={styles.rightColumn}>

                        {/* QUICK ACTIONS */}
                        <div className={styles.quickActions}>

                            <h2>Acciones Rápidas</h2>

                            <button onClick={() => router.push('/availability')}>
                                📅 Actualizar Disponibilidad
                            </button>

                            <button>
                                📈 Ver Mis Métricas
                            </button>

                            <button className={styles.primaryAction}>
                                🎥 Próximas Entrevistas
                            </button>

                        </div>

                      {/* FEEDBACK */}
                      <div className={styles.feedbackCard}>

                        <h2>
                          📄 Feedback Pendiente
                        </h2>

                        {/* ITEM */}
                        <div className={styles.feedbackItem}>

                          <h3>Luis Torres</h3>

                          <p>Simulación de Selección</p>

                          <span>
            Entrevista: 2026-05-28
        </span>

                        </div>

                        {/* ITEM */}
                        <div className={styles.feedbackItem}>

                          <h3>Sofia Ramírez</h3>

                          <p>Entrevista Técnica</p>

                          <span>
            Entrevista: 2026-05-27
        </span>

                        </div>

                        {/* BUTTON */}
                        <button className={styles.viewAllButton}>
                          Ver Todos
                        </button>

                      </div>

                    </div>

                </section>

            </main>

        </div>
    );
}