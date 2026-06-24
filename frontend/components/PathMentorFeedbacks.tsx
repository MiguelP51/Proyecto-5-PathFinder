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
  const [allCompetencias, setAllCompetencias] = useState<any[]>([]);
  const [selectedCompetencyNames, setSelectedCompetencyNames] = useState<string[]>([]);
  const [selectedCompetencyLevels, setSelectedCompetencyLevels] = useState<Record<string, { nivel: number; descripcion: string }>>({});
  
  // Custom Competency Form States
  const [isAddingCompetency, setIsAddingCompetency] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompDesc, setNewCompDesc] = useState('');
  const [newCompL0, setNewCompL0] = useState('');
  const [newCompL1, setNewCompL1] = useState('');
  const [newCompL2, setNewCompL2] = useState('');
  const [newCompL3, setNewCompL3] = useState('');
  const [newCompIsPermanent, setNewCompIsPermanent] = useState(false);

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

  const handleToggleCompetency = (name: string) => {
    setSelectedCompetencyNames(prev => {
      if (prev.includes(name)) {
        return prev.filter(n => n !== name);
      } else {
        setSelectedCompetencyLevels(levels => {
          if (!levels[name]) {
            const comp = allCompetencias.find(c => c.nombre === name);
            const desc = comp ? comp.nivel1 : 'Alcanza los criterios minimos';
            return { ...levels, [name]: { nivel: 1, descripcion: desc } };
          }
          return levels;
        });
        return [...prev, name];
      }
    });
  };

  const handleEliminarCompetenciaDelSistema = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la competencia "${name}" del catálogo del sistema?`)) {
      return;
    }

    try {
      await apiFetch(`/api/entrevistas/competencias/${id}`, {
        method: 'DELETE'
      }, session?.backendJwt);

      setAllCompetencias(prev => prev.filter(c => c.idCompetencia !== id));
      setSelectedCompetencyNames(prev => prev.filter(n => n !== name));
      setSelectedCompetencyLevels(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });

      toast.success("Competencia eliminada permanentemente del sistema");
    } catch (err) {
      console.error("Error eliminando competencia:", err);
      toast.error("Error al eliminar competencia: " + (err instanceof Error ? err.message : err));
    }
  };

  const handleCreateCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) {
      toast.warning("El nombre de la competencia es requerido");
      return;
    }

    const name = newCompName.trim();
    if (allCompetencias.some(c => c.nombre.toLowerCase() === name.toLowerCase())) {
      toast.warning("Ya existe una competencia con ese nombre");
      return;
    }

    const payload = {
      nombre: name,
      descripcion: newCompDesc.trim() || `Competencia: ${name}`,
      nivel0: newCompL0.trim() || 'Por debajo del esperado',
      nivel1: newCompL1.trim() || 'Alcanza los criterios mínimos',
      nivel2: newCompL2.trim() || 'Supera los criterios mínimos',
      nivel3: newCompL3.trim() || 'Supera las expectativas',
      puesto: newCompIsPermanent ? 'General' : 'Temporal',
      activo: true
    };

    try {
      if (newCompIsPermanent) {
        const saved = await apiFetch<any>('/api/entrevistas/competencias', {
          method: 'POST',
          body: JSON.stringify(payload)
        }, session?.backendJwt);
        
        setAllCompetencias(prev => [...prev, saved]);
        setSelectedCompetencyNames(prev => [...prev, name]);
        setSelectedCompetencyLevels(prev => ({
          ...prev,
          [name]: { nivel: 1, descripcion: saved.nivel1 }
        }));
        toast.success("Competencia agregada permanentemente al sistema");
      } else {
        setAllCompetencias(prev => [...prev, payload]);
        setSelectedCompetencyNames(prev => [...prev, name]);
        setSelectedCompetencyLevels(prev => ({
          ...prev,
          [name]: { nivel: 1, descripcion: payload.nivel1 }
        }));
        toast.success("Competencia agregada a la evaluación actual");
      }

      setIsAddingCompetency(false);
      setNewCompName('');
      setNewCompDesc('');
      setNewCompL0('');
      setNewCompL1('');
      setNewCompL2('');
      setNewCompL3('');
      setNewCompIsPermanent(false);
    } catch (err) {
      console.error("Error al crear competencia:", err);
      toast.error("Error al guardar competencia: " + (err instanceof Error ? err.message : err));
    }
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
    const selectedNames: string[] = [];
    if (item.competenciasEvaluadas && item.competenciasEvaluadas.length > 0) {
      item.competenciasEvaluadas.forEach((c: any) => {
        mapped[c.nombreCompetencia] = { nivel: c.nivelSeleccionado, descripcion: c.descripcionNivel };
        selectedNames.push(c.nombreCompetencia);
      });
      setAllCompetencias(item.competenciasEvaluadas.map((c: any) => ({
        nombre: c.nombreCompetencia,
        descripcion: '',
        nivel0: c.nivelSeleccionado === 0 ? c.descripcionNivel : 'Por debajo del esperado',
        nivel1: c.nivelSeleccionado === 1 ? c.descripcionNivel : 'Alcanza los criterios minimos',
        nivel2: c.nivelSeleccionado === 2 ? c.descripcionNivel : 'Supera los criterios minimos',
        nivel3: c.nivelSeleccionado === 3 ? c.descripcionNivel : 'Supera las expectativas'
      })));
    } else {
      setAllCompetencias([]);
    }
    setSelectedCompetencyNames(selectedNames);
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
      setAllCompetencias(res || []);
      
      const mapped: Record<string, { nivel: number; descripcion: string }> = {};
      let selectedNames: string[] = [];
      const draft = localStorage.getItem(`draft_feedback_${interviewId}`);
      const existing = feedbacks.find(f => f.id === interviewId);
      
      if (mode === 'editar' && existing && existing.competenciasEvaluadas && existing.competenciasEvaluadas.length > 0) {
        existing.competenciasEvaluadas.forEach((c: any) => {
          mapped[c.nombreCompetencia] = { nivel: c.nivelSeleccionado, descripcion: c.descripcionNivel };
          selectedNames.push(c.nombreCompetencia);
        });
      } else if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.competencyLevels) {
            Object.assign(mapped, parsed.competencyLevels);
          }
          if (parsed.competencyNames) {
            selectedNames = parsed.competencyNames;
          }
        } catch (e) {}
      } else {
        // By default, select all loaded competencies
        selectedNames = (res || []).map(c => c.nombre);
        (res || []).forEach(c => {
          mapped[c.nombre] = { nivel: 1, descripcion: c.nivel1 || 'Alcanza los criterios minimos' };
        });
      }
      setSelectedCompetencyNames(selectedNames);
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
    setSelectedCompetencyNames([]);
  };

  const handleSaveDraft = () => {
    if (!selectedFeedback) return;
    const draftData = {
      result: formResult,
      fortalezas: formFortalezas,
      areasMejora: formAreasMejora,
      comentarios: formComentarios,
      competencyLevels: selectedCompetencyLevels,
      competencyNames: selectedCompetencyNames
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

      // Map dynamic competencies (only the ones selected by the mentor)
      const compPayload = selectedCompetencyNames.map(name => {
        const c = allCompetencias.find(comp => comp.nombre === name) || {
          nombre: name,
          nivel1: 'Alcanza los criterios minimos'
        };
        const sel = selectedCompetencyLevels[name] || { nivel: 1, descripcion: c.nivel1 };
        return {
          nombreCompetencia: name,
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
                    Evaluación por Competencias (Rúbrica 0-3)
                  </div>
                </div>

                <div className="space-y-6 mt-4">
                  {/* Checkbox Selección de Dimensiones a Evaluar */}
                  {formMode !== 'ver' && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Dimensiones a evaluar en esta sesión:</h4>
                      <div className="flex flex-wrap gap-2">
                        {allCompetencias.map((comp) => {
                          const isChecked = selectedCompetencyNames.includes(comp.nombre);
                          return (
                            <label
                              key={comp.nombre}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer select-none ${
                                isChecked
                                  ? "bg-[#7447D7]/10 text-[#7447D7] border-[#7447D7]/30"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-350"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCompetency(comp.nombre)}
                                className="rounded text-[#7447D7] focus:ring-[#7447D7]"
                              />
                              <span>{comp.nombre}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tabla con Radio Buttons de Selección */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                      <thead className="bg-slate-50 font-bold text-slate-600 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 min-w-[200px]">Dimensión a evaluar</th>
                          <th className="px-4 py-4 text-center">0 - Por debajo</th>
                          <th className="px-4 py-4 text-center">1 - Mínimos</th>
                          <th className="px-4 py-4 text-center">2 - Supera</th>
                          <th className="px-4 py-4 text-center">3 - Excelente</th>
                          {formMode !== 'ver' && <th className="px-6 py-4 text-right">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {selectedCompetencyNames.length > 0 ? (
                          selectedCompetencyNames.map((compName) => {
                            const comp = allCompetencias.find(c => c.nombre === compName) || {
                              nombre: compName,
                              descripcion: '',
                              nivel0: 'Por debajo del esperado',
                              nivel1: 'Alcanza los criterios mínimos',
                              nivel2: 'Supera los criterios mínimos',
                              nivel3: 'Supera las expectativas'
                            };
                            const currentSelection = selectedCompetencyLevels[compName] || { nivel: 1, descripcion: comp.nivel1 };

                            return (
                              <tr key={compName} className="hover:bg-slate-50/40 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-extrabold text-slate-800 text-sm">{compName}</div>
                                  {comp.descripcion && <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">{comp.descripcion}</p>}
                                </td>
                                {[0, 1, 2, 3].map((lvl) => (
                                  <td key={lvl} className="px-4 py-4 text-center">
                                    <input
                                      type="radio"
                                      name={`level-${compName}`}
                                      checked={currentSelection.nivel === lvl}
                                      onChange={() => handleSelectLevel(compName, lvl, getLevelDescription(comp, lvl))}
                                      disabled={formMode === 'ver'}
                                      className="h-4 w-4 text-[#7447D7] focus:ring-[#7447D7] border-slate-300 cursor-pointer"
                                    />
                                  </td>
                                ))}
                                {formMode !== 'ver' && (
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCompetency(compName)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                        title="Quitar de esta evaluación"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                          <line x1="18" y1="6" x2="6" y2="18" />
                                          <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                      </button>
                                      {comp.idCompetencia && (
                                        <button
                                          type="button"
                                          onClick={() => handleEliminarCompetenciaDelSistema(comp.idCompetencia, compName)}
                                          className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                          title="Eliminar permanentemente del sistema"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                              Selecciona al menos una dimensión de la barra superior para iniciar la evaluación.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Rúbricas Descriptivas de los Niveles Seleccionados (Solo Lectura) */}
                  {selectedCompetencyNames.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Criterios detallados de nivel seleccionados:</h5>
                      {selectedCompetencyNames.map((compName) => {
                        const comp = allCompetencias.find(c => c.nombre === compName) || {
                          nombre: compName,
                          descripcion: '',
                          nivel0: 'Por debajo del esperado',
                          nivel1: 'Alcanza los criterios mínimos',
                          nivel2: 'Supera los criterios mínimos',
                          nivel3: 'Supera las expectativas'
                        };
                        const currentSelection = selectedCompetencyLevels[compName] || { nivel: 1, descripcion: comp.nivel1 };
                        const levelLabels = ["Por debajo de lo esperado", "Alcanza los criterios mínimos", "Supera los criterios mínimos", "Supera las expectativas"];

                        return (
                          <div key={compName} className="bg-slate-50/70 border border-slate-100/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <span className="font-extrabold text-xs text-slate-800">{compName}</span>
                              <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">
                                <span className={`inline-block mr-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  currentSelection.nivel === 0
                                    ? "bg-red-50 text-red-700"
                                    : currentSelection.nivel === 1
                                    ? "bg-blue-50 text-blue-700"
                                    : currentSelection.nivel === 2
                                    ? "bg-green-50 text-green-700"
                                    : "bg-purple-50 text-purple-700"
                                }`}>
                                  Nivel {currentSelection.nivel} - {levelLabels[currentSelection.nivel]}:
                                </span>
                                {currentSelection.descripcion}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Botón para Añadir Competencia */}
                  {formMode !== 'ver' && (
                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingCompetency(true)}
                        className="text-[#7447D7] text-xs font-extrabold flex items-center gap-1.5 hover:underline cursor-pointer"
                      >
                        + Agregar competencia adicional
                      </button>
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

      {/* POPUP MODAL: AGREGAR NUEVA DIMENSIÓN */}
      {isAddingCompetency && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Agregar Nueva Dimensión</h3>
                <p className="text-xs text-slate-400 font-medium">Define una competencia y sus rúbricas de evaluación</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCompetency(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCompetency} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[70vh]">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Nombre de la competencia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Orientación a resultados"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7447D7]/20 focus:border-[#7447D7] text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Descripción corta</label>
                <input
                  type="text"
                  placeholder="Ej. Capacidad para enfocar los esfuerzos hacia el logro de metas organizacionales..."
                  value={newCompDesc}
                  onChange={(e) => setNewCompDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7447D7]/20 focus:border-[#7447D7] text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Definición de Niveles de Rúbrica:</span>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-red-600 block">Nivel 0 - Por debajo de lo esperado</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Detalle de comportamientos del nivel 0..."
                    value={newCompL0}
                    onChange={(e) => setNewCompL0(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7447D7]/20 focus:border-[#7447D7] text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-blue-600 block">Nivel 1 - Alcanza los criterios mínimos</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Detalle de comportamientos del nivel 1..."
                    value={newCompL1}
                    onChange={(e) => setNewCompL1(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7447D7]/20 focus:border-[#7447D7] text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-green-600 block">Nivel 2 - Supera los criterios mínimos</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Detalle de comportamientos del nivel 2..."
                    value={newCompL2}
                    onChange={(e) => setNewCompL2(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7447D7]/20 focus:border-[#7447D7] text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-purple-600 block">Nivel 3 - Supera las expectativas</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Detalle de comportamientos del nivel 3..."
                    value={newCompL3}
                    onChange={(e) => setNewCompL3(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7447D7]/20 focus:border-[#7447D7] text-xs font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                <input
                  id="chk-permanent"
                  type="checkbox"
                  checked={newCompIsPermanent}
                  onChange={(e) => setNewCompIsPermanent(e.target.checked)}
                  className="h-4.5 w-4.5 rounded text-[#7447D7] focus:ring-[#7447D7] border-slate-350 cursor-pointer"
                />
                <div className="flex-1 cursor-pointer select-none">
                  <label htmlFor="chk-permanent" className="text-xs font-extrabold text-slate-700 block cursor-pointer">Confirmar guardado permanente</label>
                  <span className="text-[10px] text-slate-400 font-medium block">Habilitará esta dimensión de forma global para futuras entrevistas de evaluación</span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingCompetency(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-extrabold text-slate-600 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#7447D7] text-white hover:bg-[#633bc1] text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Agregar Dimensión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
