'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import styles from '../styles/PathMentorFeedbacks.module.css';

interface Feedback {
  id: number;
  studentName: string;
  studentEmail: string;
  interviewDate: string;
  interviewTime?: string;
  position?: string;
  status: 'Publicado' | 'Borrador' | 'Pendiente';
  result?: 'Aprobado' | 'Requiere Mejora' | 'Con Observaciones' | 'Alta' | 'Media' | 'Baja';
  score?: number; // out of 5
  scores?: {
    general: number;
    technical: number;
    communication: number;
    problemSolving: number;
  };
  fortalezas?: string;
  areasMejora?: string;
  comentarios?: string;
  lastUpdated?: string;
  competenciasEvaluadas?: Array<{
    nombreCompetencia: string;
    nivelSeleccionado: number;
    descripcionNivel: string;
  }>;
}

// Inline SVG Icons
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.studentIcon}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.calendarIcon}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const CircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// SVG Star Icon Helper
interface StarProps {
  filled: boolean;
}
const StarIcon = ({ filled }: StarProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="26" 
    height="26" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={filled ? styles.starFilled : styles.starEmpty}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function PathMentorFeedbacks() {
  const { data: session, status } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Navigation / Mode States
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'ver' | 'editar' | 'registrar'>('registrar');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Form Fields States
  const [formResult, setFormResult] = useState<'Aprobado' | 'Requiere Mejora' | 'Con Observaciones' | 'Alta' | 'Media' | 'Baja' | ''>('');
  const [formScoreGeneral, setFormScoreGeneral] = useState(0);
  const [formScoreTechnical, setFormScoreTechnical] = useState(0);
  const [formScoreCommunication, setFormScoreCommunication] = useState(0);
  const [formScoreProblemSolving, setFormScoreProblemSolving] = useState(0);
  const [formFortalezas, setFormFortalezas] = useState('');
  const [formAreasMejora, setFormAreasMejora] = useState('');
  const [formComentarios, setFormComentarios] = useState('');

  // Competencies State
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [selectedCompetencyLevels, setSelectedCompetencyLevels] = useState<Record<string, { nivel: number; descripcion: string }>>({});
  const [hoveredLevels, setHoveredLevels] = useState<Record<string, number>>({});
  const [customCompetencyName, setCustomCompetencyName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const getLevelDescription = (comp: any, level: number): string => {
    if (level === 0) return comp.nivel0 || "Por debajo del criterio esperado";
    if (level === 1) return comp.nivel1 || "Alcanza los criterios minimos";
    if (level === 2) return comp.nivel2 || "Supera los criterios minimos";
    if (level === 3) return comp.nivel3 || "Supera las expectativas";
    return "";
  };

  const handleSelectLevel = (compName: string, level: number, descText: string) => {
    setSelectedCompetencyLevels(prev => ({
      ...prev,
      [compName]: { nivel: level, descripcion: descText }
    }));
  };

  const handleAddCustomCompetency = () => {
    if (!customCompetencyName.trim()) return;
    const name = customCompetencyName.trim();
    if (competencias.some(c => c.nombre.toLowerCase() === name.toLowerCase())) {
      toast.warning("La competencia ya existe");
      return;
    }
    const newComp = {
      nombre: name,
      descripcion: "Competencia personalizada agregada por el mentor",
      nivel0: "Por debajo de lo esperado para esta competencia",
      nivel1: "Alcanza el criterio basico",
      nivel2: "Supera el nivel basico",
      nivel3: "Excelente desempeño",
      puesto: "Personalizado"
    };
    setCompetencias(prev => [...prev, newComp]);
    setCustomCompetencyName('');
    setShowCustomInput(false);
    toast.success("Competencia adicional agregada");
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.backendJwt) {
      loadFeedbacks();
    }
  }, [status, session]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any[]>("/api/entrevistas/mentor", {}, session?.backendJwt);
      const filteredData = data.filter(item => item.estado !== 'Cancelada' && item.estado !== 'Reagendada');
      const mapped = filteredData.map(item => {
        let statusVal: Feedback['status'] = item.estado === 'Completada' ? 'Publicado' : 'Pendiente';
        let resultVal = item.resultado;
        let fort = "";
        let amej = "";
        let coms = item.feedbackComentarios;
        
        // Parse comments if it's JSON
        if (item.feedbackComentarios) {
          try {
            const parsed = JSON.parse(item.feedbackComentarios);
            fort = parsed.fortalezas || "";
            amej = parsed.areasMejora || "";
            coms = parsed.comentarios || "";
          } catch (e) {
            // fallback plain text
          }
        }

        // Check local storage draft
        if (item.estado === 'Programada') {
          const draft = localStorage.getItem(`draft_feedback_${item.idEntrevista}`);
          if (draft) {
            statusVal = 'Borrador';
            try {
              const parsedDraft = JSON.parse(draft);
              resultVal = parsedDraft.result;
              fort = parsedDraft.fortalezas;
              amej = parsedDraft.areasMejora;
              coms = parsedDraft.comentarios;
            } catch (e) {}
          }
        }

        return {
          id: item.idEntrevista,
          studentName: item.estudianteNombre,
          studentEmail: item.estudianteEmail,
          interviewDate: item.fecha,
          interviewTime: item.hora,
          status: statusVal,
          result: resultVal,
          score: item.promedioCalificacion || item.competenciaProactividad,
          scores: {
            general: item.competenciaProactividad || 0,
            technical: item.competenciaTecnica || 0,
            communication: item.competenciaComunicacion || 0,
            problemSolving: item.competenciaResolucion || 0
          },
          fortalezas: fort,
          areasMejora: amej,
          comentarios: coms,
          lastUpdated: item.fecha,
          position: item.puesto || 'Sin especificar',
          competenciasEvaluadas: item.competenciasEvaluadas || []
        };
      });
      setFeedbacks(mapped);
    } catch (err) {
      console.error("Error cargando feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute Metrics Card Values Dynamically
  const totalCount = feedbacks.length;
  const pendingCount = feedbacks.filter((item) => item.status === 'Pendiente').length;
  const draftCount = feedbacks.filter((item) => item.status === 'Borrador').length;
  const publishedCount = feedbacks.filter((item) => item.status === 'Publicado').length;

  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    const nameNormalized = normalizeText(item.studentName);
    const emailNormalized = normalizeText(item.studentEmail);
    const searchNormalized = normalizeText(searchTerm);

    const matchesSearch =
      nameNormalized.includes(searchNormalized) ||
      emailNormalized.includes(searchNormalized);

    const matchesStatus =
      statusFilter === 'Todos' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action Triggers
  const handleVerFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
    setFormMode('ver');
    setFormResult(item.result || '');
    setFormFortalezas(item.fortalezas || '');
    setFormAreasMejora(item.areasMejora || '');
    setFormComentarios(item.comentarios || '');
    
    // Initialize competencies and levels
    const mapped: Record<string, { nivel: number; descripcion: string }> = {};
    if (item.competenciasEvaluadas) {
      item.competenciasEvaluadas.forEach((c: any) => {
        mapped[c.nombreCompetencia] = { nivel: c.nivelSeleccionado, descripcion: c.descripcionNivel };
      });
      setCompetencias(item.competenciasEvaluadas.map((c: any) => ({
        nombre: c.nombreCompetencia,
        descripcion: '',
        nivel0: c.nivelSeleccionado === 0 ? c.descripcionNivel : 'Por debajo del esperado',
        nivel1: c.nivelSeleccionado === 1 ? c.descripcionNivel : 'Alcanza los criterios minimos',
        nivel2: c.nivelSeleccionado === 2 ? c.descripcionNivel : 'Supera los criterios minimos',
        nivel3: c.nivelSeleccionado === 3 ? c.descripcionNivel : 'Supera las expectativas'
      })));
    } else {
      setCompetencias([]);
    }
    setSelectedCompetencyLevels(mapped);
    setActiveView('form');
  };

  const handleEditarFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
    setFormMode('editar');
    setFormResult(item.result || '');
    setFormFortalezas(item.fortalezas || '');
    setFormAreasMejora(item.areasMejora || '');
    setFormComentarios(item.comentarios || '');
    loadCompetencias(item.position || 'General', item.id, 'editar');
    setActiveView('form');
  };

  const handleRegistrarFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
    setFormMode('registrar');
    
    // Check if there is a draft in local storage
    const draft = localStorage.getItem(`draft_feedback_${item.id}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormResult(parsed.result || '');
        setFormFortalezas(parsed.fortalezas || '');
        setFormAreasMejora(parsed.areasMejora || '');
        setFormComentarios(parsed.comentarios || '');
      } catch (e) {
        resetFormFields();
      }
    } else {
      resetFormFields();
    }
    loadCompetencias(item.position || 'General', item.id, 'registrar');
    setActiveView('form');
  };

  const loadCompetencias = async (puesto: string, interviewId: number, mode: 'registrar' | 'editar') => {
    try {
      const res = await apiFetch<any[]>(`/api/entrevistas/competencias?puesto=${encodeURIComponent(puesto)}`, {}, session?.backendJwt);
      setCompetencias(res || []);
      
      const mapped: Record<string, { nivel: number; descripcion: string }> = {};
      const draft = localStorage.getItem(`draft_feedback_${interviewId}`);
      const existing = feedbacks.find(f => f.id === interviewId);
      
      if (mode === 'editar' && existing && existing.competenciasEvaluadas && existing.competenciasEvaluadas.length > 0) {
        existing.competenciasEvaluadas.forEach((c: any) => {
          mapped[c.nombreCompetencia] = { nivel: c.nivelSeleccionado, descripcion: c.descripcionNivel };
        });
      } else if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.competencyLevels) {
            Object.assign(mapped, parsed.competencyLevels);
          }
        } catch (e) {}
      } else {
        // Default to level 1 for each loaded competency
        (res || []).forEach(c => {
          mapped[c.nombre] = { nivel: 1, descripcion: c.nivel1 || 'Alcanza los criterios minimos' };
        });
      }
      setSelectedCompetencyLevels(mapped);
    } catch (err) {
      console.error("Error cargando competencias:", err);
    }
  };

  const resetFormFields = () => {
    setFormResult('');
    setFormFortalezas('');
    setFormAreasMejora('');
    setFormComentarios('');
    setSelectedCompetencyLevels({});
  };

  const handleSaveDraft = () => {
    if (!selectedFeedback) return;
    const draftData = {
      result: formResult,
      fortalezas: formFortalezas,
      areasMejora: formAreasMejora,
      comentarios: formComentarios,
      competencyLevels: selectedCompetencyLevels
    };
    localStorage.setItem(`draft_feedback_${selectedFeedback.id}`, JSON.stringify(draftData));
    toast.success("Borrador guardado localmente.");
    setActiveView('list');
    loadFeedbacks();
  };

  const handlePublish = async () => {
    if (!selectedFeedback || !session?.backendJwt) return;
    if (!formResult) {
      toast.warning('Por favor selecciona un resultado antes de publicar el feedback.');
      return;
    }

    try {
      const commentsJson = JSON.stringify({
        fortalezas: formFortalezas,
        areasMejora: formAreasMejora,
        comentarios: formComentarios
      });

      // Map dynamic competencies
      const compPayload = competencias.map(c => {
        const sel = selectedCompetencyLevels[c.nombre] || { nivel: 1, descripcion: c.nivel1 };
        return {
          nombreCompetencia: c.nombre,
          nivelSeleccionado: sel.nivel,
          descripcionNivel: sel.descripcion
        };
      });

      let averageLevel = 0;
      if (compPayload.length > 0) {
        const total = compPayload.reduce((acc, curr) => acc + curr.nivelSeleccionado, 0);
        averageLevel = Math.round((total / compPayload.length) * 1.66) + 1; // Map 0-3 to 1-5 stars for legacy compatibility
      }

      await apiFetch(`/api/entrevistas/${selectedFeedback.id}/feedback`, {
        method: "POST",
        body: JSON.stringify({
          resultado: formResult,
          feedbackComentarios: commentsJson,
          competenciaComunicacion: averageLevel || 3,
          competenciaTecnica: averageLevel || 3,
          competenciaProactividad: averageLevel || 3,
          competenciaResolucion: averageLevel || 3,
          competenciasEvaluadas: compPayload
        })
      }, session?.backendJwt);

      // Clean local draft
      localStorage.removeItem(`draft_feedback_${selectedFeedback.id}`);
      toast.success("¡Feedback publicado y notificado con éxito!");
      setActiveView('list');
      loadFeedbacks();
    } catch (err) {
      console.error("Error publicando feedback:", err);
      toast.error("Error al publicar feedback: " + (err instanceof Error ? err.message : err));
    }
  };

  return (
    <div className={styles.page}>
      {/* CONTENT */}
      <main className={styles.container}>
        {activeView === 'list' ? (
          <>
            {/* HEADER */}
            <div className={styles.header}>
              <h1>Registro de Feedbacks</h1>
              <p>Gestiona las retroalimentaciones de tus entrevistas</p>
            </div>

            {/* METRICS CARDS */}
            <section className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={`${styles.metricIcon} ${styles.iconBlue}`}>
                  <ChatIcon />
                </div>
                <h2>{totalCount}</h2>
                <p>Total Feedbacks</p>
              </div>

              <div className={styles.metricCard}>
                <div className={`${styles.metricIcon} ${styles.iconYellow}`}>
                  <ChatIcon />
                </div>
                <h2>{pendingCount}</h2>
                <p>Pendientes</p>
              </div>

              <div className={styles.metricCard}>
                <div className={`${styles.metricIcon} ${styles.iconBlueViolet}`}>
                  <ChatIcon />
                </div>
                <h2>{draftCount}</h2>
                <p>Borradores</p>
              </div>

              <div className={styles.metricCard}>
                <div className={`${styles.metricIcon} ${styles.iconGreen}`}>
                  <ChatIcon />
                </div>
                <h2>{publishedCount}</h2>
                <p>Publicados</p>
              </div>
            </section>

            {/* SEARCH & FILTERS */}
            <section className={styles.filterCard}>
              <h2>Buscar y Filtrar</h2>
              <div className={styles.filterGrid}>
                <div className={styles.filterGroup}>
                  <label htmlFor="search-input">Buscar</label>
                  <div className={styles.searchContainer}>
                    <span className={styles.searchIcon}>
                      <SearchIcon />
                    </span>
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Buscar por nombre o email..."
                      className={styles.searchInput}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <label htmlFor="status-select">Estado</label>
                  <select
                    id="status-select"
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="Todos">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Borrador">Borrador</option>
                    <option value="Publicado">Publicado</option>
                  </select>
                </div>
              </div>
            </section>

            {/* FEEDBACK LIST TABLE */}
            <section className={styles.listCard}>
              <h2>Lista de Feedbacks</h2>
              <p className={styles.listCardSub}>Retroalimentaciones de entrevistas realizadas</p>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Fecha Entrevista</th>
                      <th>Estado</th>
                      <th>Resultado</th>
                      <th>Calificación</th>
                      <th>Última Actualización</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeedbacks.length > 0 ? (
                      filteredFeedbacks.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className={styles.studentInfo}>
                              <span className={styles.studentName}>
                                <UserIcon /> {item.studentName}
                              </span>
                              <span className={styles.studentEmail}>{item.studentEmail}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.dateCell}>
                              <CalendarIcon /> {item.interviewDate}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                item.status === 'Publicado'
                                  ? styles.statusPublicado
                                  : item.status === 'Borrador'
                                  ? styles.statusBorrador
                                  : styles.statusPendiente
                              }`}
                            >
                              {item.status === 'Publicado' && <CheckIcon />}
                              {item.status === 'Borrador' && <PencilIcon />}
                              {item.status === 'Pendiente' && <CircleIcon />}
                              {item.status}
                            </span>
                          </td>
                          <td>
                            {item.result ? (
                              <span
                                className={`${styles.resultBadge} ${
                                  item.result === 'Aprobado' || item.result === 'Alta'
                                    ? styles.resultAprobado
                                    : item.result === 'Requiere Mejora' || item.result === 'Baja'
                                    ? styles.resultMejora
                                    : styles.resultObservaciones
                                }`}
                              >
                                {item.result === 'Alta'
                                  ? 'Alta probabilidad'
                                  : item.result === 'Media'
                                  ? 'Media probabilidad'
                                  : item.result === 'Baja'
                                  ? 'Baja probabilidad'
                                  : item.result}
                              </span>
                            ) : (
                              <span className={styles.resultEmpty}>-</span>
                            )}
                          </td>
                          <td>
                            {item.score !== undefined ? (
                              <div>
                                <span className={styles.scoreValue}>{item.score}</span>
                                <span className={styles.scoreMax}>/5</span>
                              </div>
                            ) : (
                              <span className={styles.emptyCell}>-</span>
                            )}
                          </td>
                          <td>
                            {item.lastUpdated || <span className={styles.emptyCell}>-</span>}
                          </td>
                          <td>
                            <div className={styles.actionsCell}>
                              {item.status === 'Publicado' && (
                                <button
                                  className={styles.btnVer}
                                  onClick={() => handleVerFeedback(item)}
                                >
                                  <EyeIcon /> Ver
                                </button>
                              )}
                              {item.status === 'Borrador' && (
                                <button
                                  className={styles.btnEditar}
                                  onClick={() => handleEditarFeedback(item)}
                                >
                                  <EyeIcon /> Editar
                                </button>
                              )}
                              {item.status === 'Pendiente' && (
                                <button
                                  className={styles.btnRegistrar}
                                  onClick={() => handleRegistrarFeedback(item)}
                                >
                                  <PencilIcon /> Registrar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No se encontraron retroalimentaciones
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* FORM HEADER */}
            <div className={styles.header}>
              <h1>
                {formMode === 'ver'
                  ? 'Detalle de Feedback'
                  : formMode === 'editar'
                  ? 'Editar Feedback'
                  : 'Registrar Feedback'}
              </h1>
              <p>
                {formMode === 'ver'
                  ? 'Visualiza la retroalimentación de la entrevista'
                  : formMode === 'editar'
                  ? 'Modifica la retroalimentación guardada'
                  : 'Completa la retroalimentación de la entrevista'}
              </p>
            </div>

            {/* FORM CONTAINER */}
            <div>
              {/* SECTION 1: INFORMACIÓN DE LA ENTREVISTA */}
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionHeaderTitle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Información de la Entrevista
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.infoCol}>
                    <span className={styles.infoTitle}>Estudiante</span>
                    <span className={styles.infoText}>{selectedFeedback?.studentName}</span>
                  </div>
                  <div className={styles.infoCol}>
                    <span className={styles.infoTitle}>Correo Electrónico</span>
                    <span className={styles.infoText}>{selectedFeedback?.studentEmail}</span>
                  </div>
                  <div className={styles.infoCol}>
                    <span className={styles.infoTitle}>Fecha y Hora</span>
                    <span className={styles.infoText}>
                      {selectedFeedback?.interviewDate} {selectedFeedback?.interviewTime ? `a las ${selectedFeedback.interviewTime}` : ''}
                    </span>
                  </div>
                  <div className={styles.infoCol}>
                    <span className={styles.infoTitle}>Puesto Postulado</span>
                    <span className={styles.infoText}>{selectedFeedback?.position || 'Sin especificar'}</span>
                  </div>
                </div>
              </section>

              {/* SECTION 2: RESULTADO DE LA EVALUACIÓN */}
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionHeaderTitle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                    Resultado de la Evaluación
                  </div>
                </div>

                <div style={{ maxWidth: '400px' }}>
                  <select
                    className={styles.formSelect}
                    value={formResult}
                    onChange={(e) => setFormResult(e.target.value as any)}
                    disabled={formMode === 'ver'}
                  >
                    <option value="" disabled>Selecciona un resultado...</option>
                    <option value="Alta">Alta probabilidad de éxito</option>
                    <option value="Media">Media probabilidad de éxito</option>
                    <option value="Baja">Baja probabilidad de éxito</option>
                  </select>

                  {formResult && (
                    <div className={styles.resultBadgeForm}>
                      <span className={`${styles.resultBadge} ${
                        formResult === 'Aprobado' || formResult === 'Alta'
                          ? styles.resultAprobado
                          : formResult === 'Requiere Mejora' || formResult === 'Baja'
                          ? styles.resultMejora
                          : styles.resultObservaciones
                      }`}>
                        {formResult === 'Alta'
                          ? 'Alta probabilidad'
                          : formResult === 'Media'
                          ? 'Media probabilidad'
                          : formResult === 'Baja'
                          ? 'Baja probabilidad'
                          : formResult}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 3: EVALUACIÓN POR COMPETENCIAS */}
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionHeaderTitle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Evaluación por Competencias (Rúbrica Factorial 0-3)
                  </div>
                </div>

                <div className="space-y-6 mt-4">
                  {competencias.length > 0 ? (
                    competencias.map((comp) => {
                      const currentSelection = selectedCompetencyLevels[comp.nombre] || { nivel: 1, descripcion: comp.nivel1 };
                      const hoverVal = hoveredLevels[comp.nombre];
                      const activeNivel = hoverVal !== undefined ? hoverVal : currentSelection.nivel;
                      
                      // Get text description of active level
                      const activeDesc = getLevelDescription(comp, activeNivel);

                      return (
                        <div key={comp.nombre} className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-extrabold text-base text-slate-800">{comp.nombre}</h3>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{comp.descripcion}</p>
                            </div>
                            
                            {/* 0-3 buttons */}
                            <div className="flex items-center gap-2">
                              {[0, 1, 2, 3].map((lvl) => {
                                const isSelected = currentSelection.nivel === lvl;
                                const labelMap = ["Por debajo del esperado", "Alcanza criterios minimos", "Supera criterios minimos", "Supera expectativas"];
                                
                                return (
                                  <button
                                    key={lvl}
                                    type="button"
                                    disabled={formMode === 'ver'}
                                    onClick={() => handleSelectLevel(comp.nombre, lvl, getLevelDescription(comp, lvl))}
                                    onMouseEnter={() => formMode !== 'ver' && setHoveredLevels(prev => ({ ...prev, [comp.nombre]: lvl }))}
                                    onMouseLeave={() => formMode !== 'ver' && setHoveredLevels(prev => {
                                      const cpy = { ...prev };
                                      delete cpy[comp.nombre];
                                      return cpy;
                                    })}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer ${
                                      isSelected
                                        ? "bg-[#7447D7] text-white border-[#7447D7] shadow-sm"
                                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                                    }`}
                                    title={labelMap[lvl]}
                                  >
                                    Nivel {lvl}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Rubric text description */}
                          <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed min-h-[60px] flex items-center">
                            <p>
                              <span className="font-bold text-[#7447D7] mr-2">
                                Nivel {activeNivel} - {
                                  activeNivel === 0 ? "Por debajo de lo esperado:" :
                                  activeNivel === 1 ? "Alcanza los criterios minimos:" :
                                  activeNivel === 2 ? "Supera los criterios minimos:" :
                                  "Supera las expectativas:"
                                }
                              </span>
                              {activeDesc}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500 italic">No hay competencias definidas para este puesto.</p>
                  )}
                  
                  {/* Competencia personalizada */}
                  {formMode !== 'ver' && (
                    <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                      {showCustomInput ? (
                        <div className="flex gap-2 max-w-md">
                          <input
                            type="text"
                            placeholder="Nombre de competencia adicional..."
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
                            value={customCompetencyName}
                            onChange={(e) => setCustomCompetencyName(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomCompetency}
                            className="bg-[#7447D7] text-white text-xs font-bold px-4 py-2 rounded-xl"
                          >
                            Agregar
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCustomInput(false)}
                            className="border border-slate-200 text-slate-500 text-xs font-bold px-3 py-2 rounded-xl"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCustomInput(true)}
                          className="text-[#7447D7] text-xs font-extrabold flex items-center gap-1.5 hover:underline"
                        >
                          + Agregar competencia adicional
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 4: RETROALIMENTACIÓN DETALLE */}
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionHeaderTitle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Retroalimentación Detalle
                  </div>
                </div>

                <div>
                  <label className={styles.textareaLabel}>Fortalezas</label>
                  <textarea
                    className={styles.textareaInput}
                    placeholder="Describe las fortalezas clave observadas en el estudiante..."
                    value={formFortalezas}
                    onChange={(e) => setFormFortalezas(e.target.value)}
                    disabled={formMode === 'ver'}
                  />

                  <label className={styles.textareaLabel}>Áreas de Mejora</label>
                  <textarea
                    className={styles.textareaInput}
                    placeholder="Identifica los aspectos en los que el estudiante debe enfocar su preparación..."
                    value={formAreasMejora}
                    onChange={(e) => setFormAreasMejora(e.target.value)}
                    disabled={formMode === 'ver'}
                  />

                  <label className={styles.textareaLabel}>Comentarios Generales</label>
                  <textarea
                    className={styles.textareaInput}
                    placeholder="Agrega cualquier observación adicional o recomendaciones de seguimiento..."
                    value={formComentarios}
                    onChange={(e) => setFormComentarios(e.target.value)}
                    disabled={formMode === 'ver'}
                  />
                </div>
              </section>

              {/* SECTION 5: ASISTENTE DE IA */}
              <section className={styles.aiCard}>
                <div className={styles.aiCardTitle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  Asistente de IA (Próximamente)
                </div>
                <p className={styles.aiCardText}>
                  Próximamente podrás generar un resumen de la retroalimentación y redactar correos de feedback automáticos de manera instantánea utilizando inteligencia artificial basada en tus calificaciones y notas.
                </p>
              </section>

              {/* ACTION BUTTONS */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnVer}
                  onClick={() => setActiveView('list')}
                >
                  {formMode === 'ver' ? 'Volver' : 'Cancelar'}
                </button>

                {formMode !== 'ver' && (
                  <>
                    <button
                      type="button"
                      className={styles.btnSaveDraft}
                      onClick={handleSaveDraft}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Guardar Borrador
                    </button>

                    <button
                      type="button"
                      className={styles.btnPublish}
                      onClick={handlePublish}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Publicar Feedback
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
