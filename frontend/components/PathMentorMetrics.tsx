'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import styles from '../styles/PathMentorMetrics.module.css';

// SVG Icons
const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

interface MonthlyMetric {
  month: string;
  interviews: number;
  avgTime: number;
  avgScore: number;
}

interface CompetenceRating {
  name: string;
  count: number;
  score: number;
}

interface RecentFeedback {
  name: string;
  date: string;
  score: number;
  result: 'Aprobado' | 'Requiere Mejora' | 'Con Observaciones' | 'Alta' | 'Media' | 'Baja';
}

interface MentorMetricsData {
  entrevistasRealizadas: number;
  entrevistasPendientes: number;
  tiempoPromedioMinutos: number;
  calificacionPromedio: number;
  desempenioMensual: Array<{
    mes: number;
    anio: number;
    nombreMes: string;
    entrevistas: number;
    tiempoPromedio: number;
    calificacionPromedio: number;
  }>;
  evaluacionCompetencias: Array<{
    nombre: string;
    totalEvaluaciones: number;
    puntajePromedio: number;
  }>;
  evaluacionesRecientes: Array<{
    estudianteNombre: string;
    fecha: string;
    puntaje: number;
    resultado: string;
  }>;
  totalEntrevistas: number;
  tasaAprobacion: number;
  calificacionGlobal: number;
}

export default function PathMentorMetrics() {
  const { data: session, status } = useSession();
  const [timeFilter, setTimeFilter] = useState('Este Mes');
  const [metrics, setMetrics] = useState<MentorMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.backendJwt) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const periodoMap: Record<string, string> = {
          'Este Mes': 'mes',
          'Últimos 3 Meses': '3meses',
          'Este Año': 'anio',
        };
        const periodo = periodoMap[timeFilter] || 'anio';
        const data = await apiFetch<MentorMetricsData>(
          `/api/entrevistas/mentor/metrics?periodo=${periodo}`,
          { signal: controller.signal },
          session?.backendJwt
        );
        if (!controller.signal.aborted) {
          setMetrics(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error("Error cargando métricas:", err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    return () => controller.abort();
  }, [status, session, timeFilter]);

  const monthlyPerformance: MonthlyMetric[] = (metrics?.desempenioMensual || []).map(m => ({
    month: m.nombreMes,
    interviews: m.entrevistas,
    avgTime: m.tiempoPromedio,
    avgScore: m.calificacionPromedio,
  }));

  const competencies: CompetenceRating[] = (metrics?.evaluacionCompetencias || []).map(c => ({
    name: c.nombre,
    count: c.totalEvaluaciones,
    score: c.puntajePromedio,
  }));

  const recentFeedbacks: RecentFeedback[] = (metrics?.evaluacionesRecientes || []).map(f => ({
    name: f.estudianteNombre,
    date: f.fecha,
    score: f.puntaje ?? 0,
    result: (f.resultado === 'Alta' ? 'Alta' :
             f.resultado === 'Media' ? 'Media' :
             f.resultado === 'Baja' ? 'Baja' :
             'Aprobado') as RecentFeedback['result'],
  }));

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <h1>Mis Métricas</h1>
            <p>Panel personalizado de tus evaluaciones</p>
          </div>
          <div>
            <select
              className={styles.filterSelect}
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="Este Mes">Este Mes</option>
              <option value="Últimos 3 Meses">Últimos 3 Meses</option>
              <option value="Este Año">Este Año</option>
            </select>
          </div>
        </div>

        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconBlue}`}>
              <BarChartIcon />
            </div>
            <h2>{loading ? '...' : metrics?.entrevistasRealizadas ?? 0}</h2>
            <p>Entrevistas Realizadas</p>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconIndigo}`}>
              <BarChartIcon />
            </div>
            <h2>{loading ? '...' : metrics?.entrevistasPendientes ?? 0}</h2>
            <p>Entrevistas Pendientes</p>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconGreen}`}>
              <BarChartIcon />
            </div>
            <h2>{loading ? '...' : metrics?.tiempoPromedioMinutos != null ? `${metrics.tiempoPromedioMinutos} min` : 'N/A'}</h2>
            <p>Tiempo Promedio</p>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconYellow}`}>
              <BarChartIcon />
            </div>
            <h2>{loading ? '...' : metrics?.calificacionPromedio != null ? metrics.calificacionPromedio.toFixed(1) : 'N/A'}</h2>
            <p>Calificación Promedio</p>
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><CalendarIcon /></span>
            <div>
              <h3>Desempeño Mensual</h3>
              <p>Evolución de tus métricas en los últimos meses</p>
            </div>
          </div>

          {loading ? (
            <p style={{ padding: '20px', color: '#6B7280' }}>Cargando...</p>
          ) : monthlyPerformance.length === 0 ? (
            <p style={{ padding: '20px', color: '#6B7280' }}>No hay datos de desempeño mensual</p>
          ) : (
            <div className={styles.monthlyContainer}>
              {monthlyPerformance.map((item, idx) => (
                <div key={idx} className={styles.monthlyCard}>
                  <div className={styles.monthlyGrid}>
                    <div className={styles.monthlyCol}>
                      <span className={styles.monthlyLabel}>Mes</span>
                      <span className={styles.monthlyVal}>{item.month}</span>
                    </div>
                    <div className={styles.monthlyCol}>
                      <span className={styles.monthlyLabel}>Entrevistas</span>
                      <span className={styles.monthlyVal}>
                        <span className={styles.monthlyValIconBlue}><UserIcon /></span>
                        {item.interviews}
                      </span>
                    </div>
                    <div className={styles.monthlyCol}>
                      <span className={styles.monthlyLabel}>Tiempo Promedio</span>
                      <span className={styles.monthlyVal}>
                        <span className={styles.monthlyValIcon}><ClockIcon /></span>
                        {item.avgTime} min
                      </span>
                    </div>
                    <div className={styles.monthlyCol}>
                      <span className={styles.monthlyLabel}>Calificación Promedio</span>
                      <span className={styles.monthlyVal}>
                        <span className={styles.monthlyValIconYellow}><StarIcon /></span>
                        {item.avgScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><BarChartIcon /></span>
            <div>
              <h3>Evaluación por Competencias</h3>
              <p>Promedios de calificación por área de competencia</p>
            </div>
          </div>

          {loading ? (
            <p style={{ padding: '20px', color: '#6B7280' }}>Cargando...</p>
          ) : competencies.length === 0 ? (
            <p style={{ padding: '20px', color: '#6B7280' }}>No hay evaluaciones por competencias</p>
          ) : (
            <div className={styles.competencyList}>
              {competencies.map((comp, idx) => (
                <div key={idx} className={styles.competencyRow}>
                  <div className={styles.competencyMeta}>
                    <span className={styles.competencyName}>
                      {comp.name}
                      <span className={styles.competencyCount}>({comp.count} evaluaciones)</span>
                    </span>
                    <span className={styles.competencyScore}>
                      {comp.score.toFixed(1)}
                      <span className={styles.competencyScoreMax}>/5</span>
                    </span>
                  </div>
                  <div className={styles.progressContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${(comp.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><CheckIcon /></span>
            <div>
              <h3>Evaluaciones Recientes</h3>
              <p>Últimos feedbacks registrados</p>
            </div>
          </div>

          {loading ? (
            <p style={{ padding: '20px', color: '#6B7280' }}>Cargando...</p>
          ) : recentFeedbacks.length === 0 ? (
            <p style={{ padding: '20px', color: '#6B7280' }}>No hay evaluaciones recientes</p>
          ) : (
            <div className={styles.recentList}>
              {recentFeedbacks.map((feedback, idx) => (
                <div key={idx} className={styles.recentCard}>
                  <div className={styles.recentLeft}>
                    <div className={styles.recentAvatar}>
                      {feedback.name.charAt(0)}
                    </div>
                    <div className={styles.recentInfo}>
                      <span className={styles.recentName}>{feedback.name}</span>
                      <span className={styles.recentDate}>{feedback.date}</span>
                    </div>
                  </div>
                  <div className={styles.recentRight}>
                    <div className={styles.recentScore}>
                      <span className={styles.recentScoreIcon}><StarIcon /></span>
                      <span>{feedback.score}</span>
                    </div>
                    <span
                      className={`${styles.recentBadge} ${
                        feedback.result === 'Aprobado' || feedback.result === 'Alta'
                          ? styles.badgeAprobado
                          : feedback.result === 'Requiere Mejora' || feedback.result === 'Baja'
                          ? styles.badgeMejora
                          : styles.badgeObservaciones
                      }`}
                    >
                      {feedback.result === 'Alta'
                        ? 'Alta probabilidad'
                        : feedback.result === 'Media'
                        ? 'Media probabilidad'
                        : feedback.result === 'Baja'
                        ? 'Baja probabilidad'
                        : feedback.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><BarChartIcon /></span>
            <div>
              <h3>Estadísticas Globales</h3>
              <p>Tu historial completo como PathMentor</p>
            </div>
          </div>

          {loading ? (
            <p style={{ padding: '20px', color: '#6B7280' }}>Cargando...</p>
          ) : (
            <div className={styles.globalRow}>
              <div className={styles.globalBox}>
                <div className={`${styles.globalVal} ${styles.valBlue}`}>
                  {metrics?.totalEntrevistas ?? 0}
                </div>
                <div className={styles.globalLabel}>Entrevistas Totales</div>
              </div>

              <div className={styles.globalBox}>
                <div className={`${styles.globalVal} ${styles.valGreen}`}>
                  {metrics?.tasaAprobacion != null ? `${metrics.tasaAprobacion}%` : '0%'}
                </div>
                <div className={styles.globalLabel}>Tasa de Aprobación</div>
              </div>

              <div className={styles.globalBox}>
                <div className={`${styles.globalVal} ${styles.valYellow}`}>
                  {metrics?.calificacionGlobal != null ? metrics.calificacionGlobal.toFixed(1) : 'N/A'}
                </div>
                <div className={styles.globalLabel}>Calificación Promedio Global</div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
