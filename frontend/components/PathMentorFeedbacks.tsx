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
  darFeedbackCv?: boolean;
  feedbackCv?: string;
  cvAvailable?: boolean;
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
  const [formDarFeedbackCv, setFormDarFeedbackCv] = useState(false);
  const [formFeedbackCv, setFormFeedbackCv] = useState('');

  // Competencies State
  const [allCompetencias, setAllCompetencias] = useState<any[]>([]);
  const [selectedCompetencyNames, setSelectedCompetencyNames] = useState<string[]>([]);
  const [selectedCompetencyLevels, setSelectedCompetencyLevels] = useState<Record<string, { nivel: number; descripcion: string }>>({});
  const [compSearchTerm, setCompSearchTerm] = useState('');
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
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
        let darCv = false;
        let fdbCv = "";
        
        // Parse comments if it's JSON
        if (item.feedbackComentarios) {
          try {
            const parsed = JSON.parse(item.feedbackComentarios);
            fort = parsed.fortalezas || "";
            amej = parsed.areasMejora || "";
            coms = parsed.comentarios || "";
            darCv = !!parsed.darFeedbackCv;
            fdbCv = parsed.feedbackCv || "";
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
          darFeedbackCv: darCv,
          feedbackCv: fdbCv,
          cvAvailable: item.cvAvailable,
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
    setFormDarFeedbackCv(!!item.darFeedbackCv);
    setFormFeedbackCv(item.feedbackCv || '');
    
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
    setFormDarFeedbackCv(!!item.darFeedbackCv);
    setFormFeedbackCv(item.feedbackCv || '');
    loadCompetencias(item.position || 'General', item.id, 'editar');
    setActiveView('form');
  };

  const handleRegistrarFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
    setFormMode('registrar');

    const draft = localStorage.getItem(`draft_feedback_${item.id}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormResult(parsed.result || '');
        setFormFortalezas(parsed.fortalezas || '');
        setFormAreasMejora(parsed.areasMejora || '');
        setFormComentarios(parsed.comentarios || '');
        setFormDarFeedbackCv(!!parsed.darFeedbackCv);
        setFormFeedbackCv(parsed.feedbackCv || '');
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
        // By default, select NO competencies (as requested by user)
        selectedNames = [];
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
    setFormDarFeedbackCv(false);
    setFormFeedbackCv('');
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
      darFeedbackCv: formDarFeedbackCv,
      feedbackCv: formFeedbackCv,
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
        comentarios: formComentarios,
        darFeedbackCv: formDarFeedbackCv,
        feedbackCv: formFeedbackCv
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

  const handleDownloadCV = async () => {
    const email = selectedFeedback?.studentEmail;
    if (!email) {
      toast.warning("No se encuentra el correo del estudiante para descargar el CV");
      return;
    }
    if (!session?.backendJwt) {
      toast.error("Sesión no autenticada. Inicia sesión nuevamente.");
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/api/cv/download/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${session.backendJwt}` }
      });
      if (!res.ok) throw new Error("CV no disponible");
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch {
      toast.error("No se pudo descargar el CV del estudiante");
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
                      
                      {/* Buscador de Competencias */}
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Buscar dimensiones de competencias..."
                          value={compSearchTerm}
                          onChange={(e) => setCompSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7447D7]/20 focus:border-[#7447D7] bg-white text-slate-800"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {allCompetencias
                          .filter((comp) => normalizeText(comp.nombre).includes(normalizeText(compSearchTerm)))
                          .map((comp) => {
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
                                  
                                  {/* Toggle Detalle */}
                                  <div className="mt-2">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedDetails(prev => ({ ...prev, [compName]: !prev[compName] }))}
                                      className="text-[#7447D7] dark:text-purple-400 text-[10px] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      {expandedDetails[compName] ? "Ocultar detalle" : "Ver detalle"}
                                    </button>
                                  </div>

                                  {/* Caja de Detalle Expansible */}
                                  {expandedDetails[compName] && (
                                    <div className="mt-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                                      <span className="font-extrabold block text-[#7447D7] dark:text-purple-400 mb-1">
                                        Nivel {currentSelection.nivel}: {
                                          currentSelection.nivel === 0 ? "Por debajo de lo esperado" :
                                          currentSelection.nivel === 1 ? "Alcanza los criterios mínimos" :
                                          currentSelection.nivel === 2 ? "Supera los criterios mínimos" :
                                          "Supera las expectativas"
                                        }
                                      </span>
                                      {currentSelection.descripcion}
                                    </div>
                                  )}
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

              {/* SECTION 3.5: RETROALIMENTACIÓN DE CV */}
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionHeaderTitle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Retroalimentación de CV
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Revisa el CV del estudiante y bríndale retroalimentación sobre la estructura, redacción, presentación y contenido de su currículum.
                  </p>

                  {selectedFeedback?.cvAvailable !== false ? (
                    <button
                      type="button"
                      onClick={handleDownloadCV}
                      className={styles.cvDownloadBtn}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Ver CV del estudiante
                    </button>
                  ) : (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-2 rounded-xl mt-2 font-bold text-center">
                      ⚠️ El estudiante no ha subido su CV a la plataforma
                    </div>
                  )}

                  <div className="mt-5">
                    <textarea
                      className={styles.textareaInput}
                      placeholder="Escribe aquí tu retroalimentación sobre el CV del estudiante, destacando aspectos de forma, fondo, redacción y contenido profesional..."
                      value={formFeedbackCv}
                      onChange={(e) => {
                        setFormFeedbackCv(e.target.value);
                        setFormDarFeedbackCv(e.target.value.trim().length > 0);
                      }}
                      disabled={formMode === 'ver'}
                    />
                  </div>
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
                      className="px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-[#7447D7] hover:bg-purple-100 text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      onClick={() => setShowPreviewModal(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Vista Previa
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

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col p-6 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal Content - Replicating student page style */}
            <div className="mt-4 space-y-6">
              
              {/* Header */}
              <div>
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5 flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Informe de retroalimentación
                </span>
                <h2 className="text-2xl font-black text-slate-950 mt-2">Detalles de tu Simulación</h2>
                <p className="text-xs text-slate-500 mt-1">Reunión de simulación de entrevista laboral para retroalimentación</p>
              </div>

              {/* Information Row */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 grid gap-4 grid-cols-2 md:grid-cols-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Tu PathMentor</span>
                  <span className="font-bold text-slate-700">{session?.user?.name || "Mentor"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Fecha de la Cita</span>
                  <span className="font-bold text-slate-700">{selectedFeedback?.interviewDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Horario</span>
                  <span className="font-bold text-slate-700">{selectedFeedback?.interviewTime || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Puesto Postulado</span>
                  <span className="font-bold text-slate-700">{selectedFeedback?.position || "Sin especificar"}</span>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="space-y-6">
                
                {/* Seccion 1: Calificación por Competencia (Full width) */}
                <div className="space-y-6">
                  {/* Decision final y promedio side by side */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Recommended Decision */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Resultado de la Simulación</h4>
                        <p className="text-[10px] text-slate-400">Decisión de postulación recomendada</p>
                      </div>

                      <div className={`p-3.5 rounded-xl border text-center font-bold text-xs ${
                        formResult === "Alta"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : formResult === "Media"
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}>
                        <span className="text-md block tracking-wide uppercase">
                          {formResult === "Alta"
                            ? "Alta probabilidad"
                            : formResult === "Media"
                            ? "Media probabilidad"
                            : formResult === "Baja"
                            ? "Baja probabilidad"
                            : "Sin resultado"}
                        </span>
                      </div>
                    </div>

                    {/* Calculated Average */}
                    {(() => {
                      const keys = selectedCompetencyNames;
                      if (keys.length === 0) return null;
                      const total = keys.reduce((acc, curr) => acc + (selectedCompetencyLevels[curr]?.nivel || 0), 0);
                      const avg = (total / keys.length).toFixed(1);
                      return (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-center text-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Promedio General</span>
                          <span className="text-3xl font-extrabold text-[#7447D7]">{avg} / 3.0</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Competencies Breakdown (Full width grid) */}
                  {selectedCompetencyNames.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Calificación por Competencia</span>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        {selectedCompetencyNames.map((compName) => {
                          const comp = allCompetencias.find(c => c.nombre === compName) || {
                            nivel1: "Alcanza los criterios mínimos"
                          };
                          const selection = selectedCompetencyLevels[compName] || { nivel: 1, descripcion: comp.nivel1 };
                          return (
                            <div key={compName} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-[11px]">
                              <div className="flex justify-between font-extrabold text-slate-800">
                                <span className="text-xs">{compName}</span>
                                <span className="text-[#7447D7] font-black text-xs">{selection.nivel} / 3</span>
                              </div>

                              <div className="flex gap-0.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                {[0, 1, 2, 3].map((lvl) => (
                                  <div
                                    key={lvl}
                                    className={`flex-1 rounded-full ${
                                      lvl <= selection.nivel
                                        ? "bg-gradient-to-r from-[#7447D7] to-[#D43EE6]"
                                        : "bg-slate-200"
                                    }`}
                                  />
                                ))}
                              </div>

                              <p className="text-[10px] text-slate-500 leading-relaxed italic mt-1">
                                <span className="font-bold text-[#7447D7]">
                                  {selection.nivel === 0 ? "Nivel 0 (Bajo esperado): " :
                                   selection.nivel === 1 ? "Nivel 1 (Mínimo): " :
                                   selection.nivel === 2 ? "Nivel 2 (Supera Mínimo): " :
                                   "Nivel 3 (Excelente): "}
                                </span>
                                {selection.descripcion}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Seccion 2: Comentarios y Recomendaciones (Full width) */}
                <div className="grid gap-6 md:grid-cols-2">
                  {formFortalezas && (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 animate-in fade-in">
                        💪 Fortalezas Clave
                      </span>
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 h-full">
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          {formFortalezas}
                        </p>
                      </div>
                    </div>
                  )}

                  {formAreasMejora && (
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 animate-in fade-in">
                        📈 Áreas de Mejora
                      </span>
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 h-full">
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          {formAreasMejora}
                        </p>
                      </div>
                    </div>
                  )}

                  {formComentarios && (
                    <div className="space-y-2 md:col-span-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-800 animate-in fade-in">
                        💬 Observaciones y Recomendaciones
                      </span>
                      <div className="rounded-xl bg-purple-50/5 p-4 border border-purple-100/50 italic">
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          "{formComentarios}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seccion 3: Retroalimentación de CV */}
                {formDarFeedbackCv && formFeedbackCv && (
                  <div className="bg-gradient-to-r from-blue-50/40 via-indigo-50/10 to-purple-50/30 rounded-2xl border border-indigo-100 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                      <h4 className="text-xs font-bold text-indigo-900">Retroalimentación Dedicada sobre tu CV</h4>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-100/60">
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {formFeedbackCv}
                      </p>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
