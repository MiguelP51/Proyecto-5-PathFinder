'use client';

import styles from '../styles/PathMentorDashboard.module.css';
import Navbar from '@/components/Navbar';
import PathMentorNavbar from '@/components/PathMentorNavbar';
import { useRouter } from 'next/navigation';

export default function PathMentorDashboard() {
  const router = useRouter();
  return (
    <>
      <Navbar />
      <PathMentorNavbar />

      <div className={styles.container}>

        {/* HEADER */}
        <div className={styles.header}>
          <h1>¡Bienvenido de vuelta!</h1>

          <p>
            Gestiona tus entrevistas y evaluaciones
          </p>
        </div>

        {/* METRICS */}
        <div className={styles.metricsGrid}>

          <div className={styles.metricCard}>
            <div className={styles.metricIconBlue}>📅</div>

            <h2>24</h2>

            <p>Entrevistas del Mes</p>

            <span>+4 vs mes anterior</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconPurple}>🕒</div>

            <h2>6</h2>

            <p>Próximas esta Semana</p>

            <span>2 hoy</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconGreen}>👥</div>

            <h2>87</h2>

            <p>Estudiantes Evaluados</p>

            <span>Total histórico</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconYellow}>⭐</div>

            <h2>4.8</h2>

            <p>Calificación Promedio</p>

            <span>★★★★★</span>
          </div>

        </div>

        {/* MAIN GRID */}
        <div className={styles.mainGrid}>

          {/* LEFT COLUMN */}
          <div className={styles.leftColumn}>

            <div className={styles.sectionCard}>

              <div className={styles.sectionHeader}>

                <div>
                  <h2>📅 Próximas Entrevistas</h2>

                  <p>
                    Entrevistas programadas para los próximos días
                  </p>
                </div>

                <button className={styles.outlineButton}>
                  Ver Todas
                </button>

              </div>

              {/* INTERVIEW 1 */}
              <div className={styles.interviewCard}>

                <div>

                  <h3>María González</h3>

                  <div className={styles.interviewInfo}>
                    <span>📅 2026-05-30</span>
                    <span>🕒 10:00</span>
                  </div>

                </div>

                <div className={styles.interviewStatus}>

                  <span className={styles.virtualTag}>
                    🎥 Virtual
                  </span>

                  <span className={styles.reviewedTag}>
                    ✔ Perfil revisado
                  </span>

                </div>

              </div>

              {/* INTERVIEW 2 */}
              <div className={styles.interviewCard}>

                <div>

                  <h3>Carlos Pérez</h3>

                  <div className={styles.interviewInfo}>
                    <span>📅 2026-05-30</span>
                    <span>🕒 14:00</span>
                  </div>

                  <button className={styles.profileButton}>
                    📄 Revisar Perfil
                  </button>

                </div>

                <div className={styles.interviewStatus}>

                  <span className={styles.presentialTag}>
                    Presencial
                  </span>

                  <span className={styles.pendingTag}>
                    ⚠ Pendiente revisión
                  </span>

                </div>

              </div>

              {/* INTERVIEW 3 */}
              <div className={styles.interviewCard}>

                <div>

                  <h3>Ana Martínez</h3>

                  <div className={styles.interviewInfo}>
                    <span>📅 2026-05-31</span>
                    <span>🕒 11:00</span>
                  </div>

                  <button className={styles.profileButton}>
                    📄 Revisar Perfil
                  </button>

                </div>

                <div className={styles.interviewStatus}>

                  <span className={styles.virtualTag}>
                    🎥 Virtual
                  </span>

                  <span className={styles.pendingTag}>
                    ⚠ Pendiente revisión
                  </span>

                </div>

              </div>

            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightColumn}>

            {/* QUICK ACTIONS */}
            <div className={styles.sideCard}>

              <h2>Acciones Rápidas</h2>

              <button
                  className={styles.sideButton}
                  onClick={() => router.push('/availability')}
              >
                📅 Actualizar Disponibilidad
              </button>

              <button className={styles.sideButton}>
                📈 Ver Mis Métricas
              </button>

              <button className={styles.primaryButton}>
                🎥 Próximas Entrevistas
              </button>

            </div>

            {/* FEEDBACK */}
            <div className={styles.sideCard}>

              <h2>📄 Feedback Pendiente</h2>

              <div className={styles.feedbackCard}>

                <h3>Luis Torres</h3>

                <p>Simulación de Selección</p>

                <span>
                  Entrevista: 2026-05-28
                </span>

              </div>

              <div className={styles.feedbackCard}>

                <h3>Sofía Ramírez</h3>

                <p>Entrevista Técnica</p>

                <span>
                  Entrevista: 2026-05-27
                </span>

              </div>

              <button className={styles.outlineButtonFull}>
                Ver Todos
              </button>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}