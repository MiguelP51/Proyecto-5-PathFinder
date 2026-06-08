'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import styles from '../styles/PathMentorDashboard.module.css';

interface Entrevista {
  idEntrevista: number;
  idEstudiante: number;
  estudianteNombre: string;
  estudianteEmail: string;
  idMentor: number;
  mentorNombre: string;
  mentorEmail: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  tipo: string; // virtual / presencial
  estado: string; // Programada / Completada / Cancelada
  virtualLink: string;
  resultado: string;
  feedbackComentarios: string;
  competenciaComunicacion: number;
  competenciaTecnica: number;
  competenciaProactividad: number;
  competenciaResolucion: number;
}

export default function PathMentorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [interviews, setInterviews] = useState<Entrevista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.backendJwt) {
      loadInterviews();
    }
  }, [status, session]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Entrevista[]>("/api/entrevistas/mentor", {}, session?.backendJwt);
      setInterviews(data || []);
    } catch (err) {
      console.error("Error cargando entrevistas en dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', color: '#7447D7' }} />
          <p style={{ color: '#64748b', fontWeight: '500' }}>Cargando tu panel de control...</p>
        </div>
      </div>
    );
  }

  // Filtros de estado
  const completed = interviews.filter(i => i.estado === "Completada");
  const scheduled = interviews.filter(i => i.estado === "Programada");

  // 1. Entrevistas del Mes (Mes actual)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const thisMonthInterviews = interviews.filter(i => {
    try {
      const parts = i.fecha.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;
        return y === currentYear && m === currentMonth;
      }
    } catch {}
    return false;
  });
  const entrevistasMesCount = thisMonthInterviews.length;

  // 2. Próximas esta Semana (Próximos 7 días)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const thisWeekInterviews = scheduled.filter(i => {
    try {
      const parts = i.fecha.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d >= today && d <= nextWeek;
      }
    } catch {}
    return false;
  });
  const proximasSemanaCount = thisWeekInterviews.length;

  const todayStr = now.toISOString().split("T")[0];
  const todayCount = scheduled.filter(i => i.fecha === todayStr).length;

  // 3. Estudiantes Evaluados (Total Completadas)
  const evaluadosCount = completed.length;

  // 4. Calificación Promedio (Promedio del promedio de competencias)
  let avgCalificacion = 0;
  if (completed.length > 0) {
    const totalScore = completed.reduce((acc, curr) => {
      const com = curr.competenciaComunicacion || 5;
      const tec = curr.competenciaTecnica || 5;
      const pro = curr.competenciaProactividad || 5;
      const res = curr.competenciaResolucion || 5;
      return acc + (com + tec + pro + res) / 4;
    }, 0);
    avgCalificacion = Math.round((totalScore / completed.length) * 10) / 10;
  }
  const ratingText = avgCalificacion > 0 ? avgCalificacion.toFixed(1) : "5.0";
  const starsText = "★".repeat(Math.round(avgCalificacion || 5)) + "☆".repeat(5 - Math.round(avgCalificacion || 5));

  // Próximas entrevistas (primeras 3 ordenadas cronológicamente)
  const proximasEntrevistas = [...scheduled]
    .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`))
    .slice(0, 3);

  // Feedback Pendiente: Entrevistas programadas en fecha anterior o igual a hoy (que ya deberían haber ocurrido)
  const feedbackPendientes = scheduled
    .filter(i => i.fecha <= todayStr)
    .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`))
    .slice(0, 2);

  return (
    <div className={styles.page}>
      {/* CONTENT */}
      <main className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h1>¡Bienvenido de vuelta!</h1>
          <p>Gestiona tus entrevistas y evaluaciones</p>
        </div>

        {/* METRICS */}
        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIconBlue}>📅</div>
            <h2>{entrevistasMesCount}</h2>
            <p>Entrevistas del Mes</p>
            <span>Este mes calendario</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconPurple}>🕒</div>
            <h2>{proximasSemanaCount}</h2>
            <p>Próximas esta Semana</p>
            <span>{todayCount} hoy</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconGreen}>👥</div>
            <h2>{evaluadosCount}</h2>
            <p>Estudiantes Evaluados</p>
            <span>Total histórico</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconYellow}>⭐</div>
            <h2>{ratingText}</h2>
            <p>Calificación Promedio</p>
            <span>{starsText}</span>
          </div>
        </section>

        {/* BOTTOM GRID */}
        <section className={styles.bottomGrid}>
          {/* LEFT: Próximas Entrevistas */}
          <div className={styles.interviewsCard}>
            <div className={styles.cardHeader}>
              <h2>📅 Próximas Entrevistas</h2>
              <button onClick={() => router.push('/mentor/interviews')}>
                Ver Todas
              </button>
            </div>
            <p className={styles.cardSubtitle}>
              Entrevistas programadas para los próximos días
            </p>

            {proximasEntrevistas.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic', marginTop: '16px' }}>
                No tienes entrevistas programadas en este momento.
              </p>
            ) : (
              proximasEntrevistas.map((item) => (
                <div key={item.idEntrevista} className={styles.interviewItem}>
                  <div>
                    <h3>{item.estudianteNombre}</h3>
                    <span>
                      {item.fecha} • {item.hora}
                    </span>
                  </div>
                  <div className={item.tipo === 'virtual' ? styles.virtualBadge : styles.presentialBadge}>
                    {item.tipo === 'virtual' ? '🎥 Virtual' : '📍 Presencial'}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightColumn}>
            {/* QUICK ACTIONS */}
            <div className={styles.quickActions}>
              <h2>Acciones Rápidas</h2>
              <button onClick={() => router.push('/mentor/availability')}>
                📅 Actualizar Disponibilidad
              </button>
              <button onClick={() => router.push('/mentor/metrics')}>
                📈 Ver Mis Métricas
              </button>
              <button className={styles.primaryAction} onClick={() => router.push('/mentor/interviews')}>
                🎥 Próximas Entrevistas
              </button>
            </div>

            {/* FEEDBACK */}
            <div className={styles.feedbackCard}>
              <h2>📄 Feedback Pendiente</h2>

              {feedbackPendientes.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '14px', margin: '8px 0' }}>
                  ¡Al día! No tienes evaluaciones pendientes de registrar.
                </p>
              ) : (
                feedbackPendientes.map((item) => (
                  <div key={item.idEntrevista} className={styles.feedbackItem} style={{ marginBottom: '12px' }}>
                    <h3>{item.estudianteNombre}</h3>
                    <p>Simulación de Selección ({item.tipo === 'virtual' ? 'Virtual' : 'Presencial'})</p>
                    <span>
                      Entrevista: {item.fecha} a las {item.hora}
                    </span>
                  </div>
                ))
              )}

              <button className={styles.viewAllButton} onClick={() => router.push('/mentor/feedbacks')}>
                Ver Todos
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}