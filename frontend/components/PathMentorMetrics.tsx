'use client';

import { useState } from 'react';
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

const ArrowUpRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const ArrowDownLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="7" x2="7" y2="17" />
    <polyline points="17 17 7 17 7 7" />
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
  result: 'Aprobado' | 'Requiere Mejora' | 'Con Observaciones';
}

export default function PathMentorMetrics() {
  const [timeFilter, setTimeFilter] = useState('Este Mes');

  // Mock data matching the UI screenshots
  const monthlyPerformance: MonthlyMetric[] = [
    { month: 'Enero', interviews: 12, avgTime: 45, avgScore: 4.1 },
    { month: 'Febrero', interviews: 15, avgTime: 43, avgScore: 4.2 },
    { month: 'Marzo', interviews: 14, avgTime: 44, avgScore: 4.0 },
    { month: 'Abril', interviews: 18, avgTime: 41, avgScore: 4.3 },
    { month: 'Mayo', interviews: 16, avgTime: 42, avgScore: 4.3 },
  ];

  const competencies: CompetenceRating[] = [
    { name: 'Habilidades Técnicas', count: 16, score: 4.2 },
    { name: 'Comunicación', count: 16, score: 4.5 },
    { name: 'Resolución de Problemas', count: 16, score: 3.8 },
    { name: 'Trabajo en Equipo', count: 16, score: 4.3 },
  ];

  const recentFeedbacks: RecentFeedback[] = [
    { name: 'María González', date: '2026-05-28', score: 5, result: 'Aprobado' },
    { name: 'Carlos Pérez', date: '2026-05-26', score: 4, result: 'Con Observaciones' },
    { name: 'Ana Martínez', date: '2026-05-24', score: 5, result: 'Aprobado' },
    { name: 'Luis Torres', date: '2026-05-22', score: 3, result: 'Requiere Mejora' },
  ];

  return (
    <div className={styles.page}>
      {/* CONTENT */}
      <main className={styles.container}>
        {/* HEADER */}
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

        {/* METRICS CARDS */}
        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconBlue}`}>
              <BarChartIcon />
            </div>
            <h2>16</h2>
            <p>Entrevistas Realizadas</p>
            <div className={`${styles.trendContainer} ${styles.trendPositive}`}>
              <span className={styles.trendIcon}><ArrowUpRight /></span>
              <span>+3 vs mes anterior</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconIndigo}`}>
              <BarChartIcon />
            </div>
            <h2>8</h2>
            <p>Entrevistas Pendientes</p>
            <div className={`${styles.trendContainer} ${styles.trendPositive}`}>
              <span className={styles.trendIcon}><ArrowUpRight /></span>
              <span>+2 vs mes anterior</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconGreen}`}>
              <BarChartIcon />
            </div>
            <h2>42 min</h2>
            <p>Tiempo Promedio</p>
            <div className={`${styles.trendContainer} ${styles.trendPositive}`}>
              <span className={styles.trendIcon}><ArrowDownLeft /></span>
              <span>-5 min vs mes anterior</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconYellow}`}>
              <BarChartIcon />
            </div>
            <h2>4.3</h2>
            <p>Calificación Promedio</p>
            <div className={`${styles.trendContainer} ${styles.trendPositive}`}>
              <span className={styles.trendIcon}><ArrowUpRight /></span>
              <span>+0.2 vs mes anterior</span>
            </div>
          </div>
        </section>

        {/* DESEMPEÑO MENSUAL */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><CalendarIcon /></span>
            <div>
              <h3>Desempeño Mensual</h3>
              <p>Evolución de tus métricas en los últimos meses</p>
            </div>
          </div>

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
        </section>

        {/* EVALUACIÓN POR COMPETENCIAS */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><BarChartIcon /></span>
            <div>
              <h3>Evaluación por Competencias</h3>
              <p>Promedios de calificación por área de competencia</p>
            </div>
          </div>

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
        </section>

        {/* EVALUACIONES RECIENTES */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><CheckIcon /></span>
            <div>
              <h3>Evaluaciones Recientes</h3>
              <p>Últimos feedbacks registrados</p>
            </div>
          </div>

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
                      feedback.result === 'Aprobado'
                        ? styles.badgeAprobado
                        : feedback.result === 'Requiere Mejora'
                        ? styles.badgeMejora
                        : styles.badgeObservaciones
                    }`}
                  >
                    {feedback.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ESTADÍSTICAS GLOBALES */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><BarChartIcon /></span>
            <div>
              <h3>Estadísticas Globales</h3>
              <p>Tu historial completo como PathMentor</p>
            </div>
          </div>

          <div className={styles.globalRow}>
            <div className={styles.globalBox}>
              <div className={`${styles.globalVal} ${styles.valBlue}`}>74</div>
              <div className={styles.globalLabel}>Entrevistas Totales</div>
            </div>

            <div className={styles.globalBox}>
              <div className={`${styles.globalVal} ${styles.valGreen}`}>92%</div>
              <div className={styles.globalLabel}>Tasa de Aprobación</div>
            </div>

            <div className={styles.globalBox}>
              <div className={`${styles.globalVal} ${styles.valYellow}`}>4.3</div>
              <div className={styles.globalLabel}>Calificación Promedio Global</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
