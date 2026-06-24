'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import styles from '../styles/PathMentorInterviews.module.css';
import { toast } from 'sonner';

interface Interview {
  id: number;
  idEstudiante?: number;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  status: 'Programada' | 'Completada' | 'Cancelada' | 'Reagendada';
  link?: string;
  discResult?: string;
  cvAvailable?: boolean;
  motivoCancelacion?: string;
  feedbackComentarios?: string;
}

const CameraIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={styles.cameraIcon}
  >
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={styles.searchIcon}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ marginRight: '6px', color: '#64748b' }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ClockIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ marginRight: '6px', color: '#64748b' }}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const VideoIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ marginRight: '8px' }}
  >
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const DocumentIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ marginRight: '8px' }}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ChartIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ marginRight: '8px' }}
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export default function PathMentorInterviews() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Programada');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeInterviewId, setActiveInterviewId] = useState<number | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');

  // Detail Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailInterview, setSelectedDetailInterview] = useState<Interview | null>(null);

  // Student Profile detail view states
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showCVDetails, setShowCVDetails] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Student DISC detail view states
  const [selectedStudentDISC, setSelectedStudentDISC] = useState<any | null>(null);
  const [loadingDISC, setLoadingDISC] = useState(false);
  const [showDISCDetails, setShowDISCDetails] = useState(false);

  // Reschedule states
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleInterview, setRescheduleInterview] = useState<Interview | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [manualTimeInput, setManualTimeInput] = useState('');
  const [mentorAvailability, setMentorAvailability] = useState<any>(null);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<any[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const DAYS_UPPER = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
  const RESCHEDULE_START_HOUR = 8;
  const RESCHEDULE_HOUR_HEIGHT = 36;
  const RESCHEDULE_HOURS = Array.from({ length: 10 }, (_, i) => i + 8);

  const getWeekDates = (offset: number): Date[] => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return DAYS_FULL.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const formatWeekRange = (dates: Date[]): string => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const s = dates[0];
    const e = dates[6];
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
      return `Semana del ${s.getDate()} al ${e.getDate()} de ${months[s.getMonth()]}, ${s.getFullYear()}`;
    if (s.getFullYear() === e.getFullYear())
      return `Semana del ${s.getDate()} de ${months[s.getMonth()]} al ${e.getDate()} de ${months[e.getMonth()]}, ${s.getFullYear()}`;
    return `Semana del ${s.getDate()} de ${months[s.getMonth()]} ${s.getFullYear()} al ${e.getDate()} de ${months[e.getMonth()]} ${e.getFullYear()}`;
  };

  const rescheduleTimeToY = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return ((h * 60 + m - RESCHEDULE_START_HOUR * 60) / 60) * RESCHEDULE_HOUR_HEIGHT;
  };

  const getBlocksForDay = (date: Date): any[] => {
    const dayIndex = date.getDay();
    const dayName = DAYS_UPPER[dayIndex === 0 ? 6 : dayIndex - 1];
    return availabilityBlocks.filter(b => b.diaSemana === dayName);
  };

  const isDayAvailable = (date: Date): boolean => {
    const dayIndex = date.getDay();
    const dayName = DAYS_UPPER[dayIndex === 0 ? 6 : dayIndex - 1];
    return availableDays.includes(dayName);
  };

  const generateSlotsForDate = (date: Date): string[] => {
    const dayIndex = date.getDay();
    const dayName = DAYS_UPPER[dayIndex === 0 ? 6 : dayIndex - 1];
    const dayBlocks = availabilityBlocks.filter(b => b.diaSemana === dayName);
    const slots: string[] = [];

    for (const block of dayBlocks) {
      const [startH, startM] = block.horaInicio.split(':').map(Number);
      const [endH, endM] = block.horaFin.split(':').map(Number);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;

      while (current < end) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        slots.push(timeStr);
        current += 60;
      }
    }

    return slots;
  };

  const weekDates = getWeekDates(weekOffset);

  const handleOpenReschedule = async (interview: Interview) => {
    setRescheduleInterview(interview);
    setSelectedDate(null);
    setSelectedTime('');
    setManualTimeInput('');
    setWeekOffset(0);
    setIsRescheduleModalOpen(true);

    if (session?.backendJwt) {
      setLoadingAvailability(true);
      try {
        const data = await apiFetch<any>("/api/disponibilidad/mentor", {}, session.backendJwt);
        setMentorAvailability(data);
        setAvailableDays(data.diasDisponibles || []);
        setAvailabilityBlocks(data.bloques || []);
      } catch {
        setAvailableDays([]);
        setAvailabilityBlocks([]);
      } finally {
        setLoadingAvailability(false);
      }
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleInterview || !selectedDate || !selectedTime) return;

    const fechaStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    setSubmittingReschedule(true);
    try {
      await apiFetch(`/api/entrevistas/${rescheduleInterview.id}/reprogramar`, {
        method: "PUT",
        body: JSON.stringify({
          nuevaFecha: fechaStr,
          nuevaHora: selectedTime
        })
      }, session?.backendJwt);

      toast.success("Entrevista reprogramada exitosamente. Recargando...");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al reprogramar la entrevista";
      toast.error(msg);
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any[]>("/api/entrevistas/mentor", {}, session?.backendJwt);
      const mapped = data.map(item => ({
        id: item.idEntrevista,
        idEstudiante: item.idEstudiante,
        studentName: item.estudianteNombre,
        studentEmail: item.estudianteEmail,
        date: item.fecha,
        time: item.hora,
        status: item.estado,
        link: item.virtualLink,
        discResult: item.discNombrePerfil,
        cvAvailable: item.cvAvailable,
        motivoCancelacion: item.motivoCancelacion,
        feedbackComentarios: item.feedbackComentarios
      }));
      setInterviews(mapped);
    } catch (err) {
      console.error("Error cargando entrevistas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'authenticated' || !session?.backendJwt) return;
    let cancelled = false;

    const doFetch = async () => {
      try {
        const data = await apiFetch<any[]>("/api/entrevistas/mentor", {}, session?.backendJwt);
        if (cancelled) return;
        const mapped = data.map(item => ({
          id: item.idEntrevista,
          idEstudiante: item.idEstudiante,
          studentName: item.estudianteNombre,
          studentEmail: item.estudianteEmail,
          date: item.fecha,
          time: item.hora,
          status: item.estado,
          link: item.virtualLink,
          discResult: item.discNombrePerfil,
          cvAvailable: item.cvAvailable,
          motivoCancelacion: item.motivoCancelacion,
          feedbackComentarios: item.feedbackComentarios
        }));
        setInterviews(mapped);

        const idParam = searchParams.get('id');
        if (idParam) {
          const id = parseInt(idParam, 10);
          if (!isNaN(id)) {
            const found = mapped.find((iv) => iv.id === id);
            if (found) {
              setSelectedDetailInterview(found);
              setIsDetailModalOpen(true);
              router.replace('/mentor/interviews');
            }
          }
        }
      } catch (err) {
        if (!cancelled) console.error("Error cargando entrevistas:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    doFetch();

    return () => { cancelled = true; };
  }, [status, session, searchParams, router]);

  const loadStudentProfile = async (email: string) => {
    if (!session?.backendJwt) return;
    try {
      setLoadingProfile(true);
      setSelectedStudentProfile(null);
      const data = await apiFetch<any>(`/api/profile/student/${email}`, {}, session?.backendJwt);
      setSelectedStudentProfile(data);
    } catch (err) {
      console.error("Error cargando perfil del estudiante:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadStudentDISC = async (id: number) => {
    if (!session?.backendJwt) return;
    try {
      setLoadingDISC(true);
      setSelectedStudentDISC(null);
      const data = await apiFetch<any>(`/api/disc/result/student/${id}`, {}, session?.backendJwt);
      setSelectedStudentDISC(data);
    } catch (err) {
      console.error("Error cargando resultado DISC del estudiante:", err);
    } finally {
      setLoadingDISC(false);
    }
  };

  const viewCV = async (email: string) => {
    if (!session?.backendJwt) return;
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      let backendUrl = rawBackendUrl;
      if (rawBackendUrl.endsWith("/api")) {
        backendUrl = rawBackendUrl.slice(0, -4);
      } else if (rawBackendUrl.endsWith("/api/")) {
        backendUrl = rawBackendUrl.slice(0, -5);
      }
      if (typeof window !== "undefined" && backendUrl.startsWith("http")) {
        const currentProtocol = window.location.protocol;
        if (backendUrl.startsWith("http:") && currentProtocol === "https:") {
          backendUrl = backendUrl.replace(/^http:/, "https:");
        } else if (backendUrl.startsWith("https:") && currentProtocol === "http:") {
          backendUrl = backendUrl.replace(/^https:/, "http:");
        }
      }

      const response = await fetch(`${backendUrl}/api/cv/download/${email}`, {
        headers: {
          'Authorization': `Bearer ${session.backendJwt}`
        }
      });
      if (!response.ok) throw new Error("No se pudo descargar el archivo");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error("Error al visualizar CV:", err);
      toast.error("Error al visualizar el archivo en formato PDF");
    }
  };

  const downloadCV = async (email: string, studentName: string) => {
    if (!session?.backendJwt) return;
    try {
      const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      let backendUrl = rawBackendUrl;
      if (rawBackendUrl.endsWith("/api")) {
        backendUrl = rawBackendUrl.slice(0, -4);
      } else if (rawBackendUrl.endsWith("/api/")) {
        backendUrl = rawBackendUrl.slice(0, -5);
      }
      if (typeof window !== "undefined" && backendUrl.startsWith("http")) {
        const currentProtocol = window.location.protocol;
        if (backendUrl.startsWith("http:") && currentProtocol === "https:") {
          backendUrl = backendUrl.replace(/^http:/, "https:");
        } else if (backendUrl.startsWith("https:") && currentProtocol === "http:") {
          backendUrl = backendUrl.replace(/^https:/, "http:");
        }
      }

      const response = await fetch(`${backendUrl}/api/cv/download/${email}`, {
        headers: {
          'Authorization': `Bearer ${session.backendJwt}`
        }
      });
      if (!response.ok) throw new Error("No se pudo descargar el archivo");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${studentName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CV descargado correctamente.");
    } catch (err) {
      console.error("Error al descargar CV:", err);
      toast.error("Error al descargar el archivo en formato PDF");
    }
  };

  const totalCount = interviews.length;
  const programmedCount = interviews.filter((item) => item.status === 'Programada').length;
  const completedCount = interviews.filter((item) => item.status === 'Completada').length;

  const thisWeekCount = interviews.filter((item) => {
    const dateObj = new Date(item.date);
    return (
      dateObj.getFullYear() === 2026 &&
      dateObj.getMonth() === 5 &&
      dateObj.getDate() >= 1 &&
      dateObj.getDate() <= 7
    );
  }).length;

  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filteredInterviews = interviews.filter((item) => {
    const nameNormalized = normalizeText(item.studentName);
    const emailNormalized = normalizeText(item.studentEmail);
    const searchNormalized = normalizeText(searchTerm);

    const matchesSearch =
      nameNormalized.includes(searchNormalized) ||
      emailNormalized.includes(searchNormalized);

    const matchesStatus =
      statusFilter === 'Todas' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (interview: Interview) => {
    setActiveInterviewId(interview.id);
    setMeetingLinkInput(interview.link || '');
    setIsModalOpen(true);
  };

  const handleSaveLink = async () => {
    if (activeInterviewId !== null && session?.backendJwt) {
      let link = meetingLinkInput.trim();
      if (!link) {
        toast.warning("Por favor, ingresa el enlace de la reunión.");
        return;
      }

      if (!/^https?:\/\//i.test(link)) {
        link = 'https://' + link;
      }

      const urlLower = link.toLowerCase();
      const validDomains = [
        'zoom.us',
        'meet.google.com',
        'teams.microsoft.com',
        'teams.live.com',
        'join.skype.com',
        'webex.com',
        'meet.jit.si'
      ];
      
      const isValid = validDomains.some(domain => urlLower.includes(domain));
      if (!isValid) {
        toast.error("El enlace de la reunión no es válido. Debe ser de Zoom, Google Meet, Teams, Skype, Webex o Jitsi.");
        return;
      }

      try {
        await apiFetch(`/api/entrevistas/${activeInterviewId}/enlace`, {
          method: "PUT",
          body: JSON.stringify({ virtualLink: link })
        }, session?.backendJwt);
        
        toast.success("Enlace virtual guardado y enviado al estudiante por correo.");
        setIsModalOpen(false);
        loadInterviews();
      } catch (err) {
        console.error("Error guardando enlace:", err);
        toast.error("Error al guardar enlace: " + (err instanceof Error ? err.message : err));
      }
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>Mis Entrevistas</h1>
          <p>Gestiona tus entrevistas programadas y completa el feedback</p>
        </div>

        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconBlue}`}>📅</div>
            <h2>{totalCount}</h2>
            <p>Total Entrevistas</p>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconBlueViolet}`}>📅</div>
            <h2>{programmedCount}</h2>
            <p>Programadas</p>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconGreen}`}>📅</div>
            <h2>{completedCount}</h2>
            <p>Completadas</p>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.iconPurple}`}>📅</div>
            <h2>{thisWeekCount}</h2>
            <p>Esta Semana</p>
          </div>
        </section>

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
                <option value="Todas">Todas</option>
                <option value="Programada">Programada</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Reagendada">Reagendada</option>
              </select>
            </div>
          </div>
        </section>

        <section className={styles.listCard}>
          <h2>Lista de Entrevistas</h2>
          <p className={styles.listCardSub}>Entrevistas programadas y completadas</p>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Enlace</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.length > 0 ? (
                  filteredInterviews.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className={styles.studentInfo}>
                          <span className={styles.studentName}>{item.studentName}</span>
                          <span className={styles.studentEmail}>{item.studentEmail}</span>
                        </div>
                      </td>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            item.status === 'Programada'
                              ? styles.statusProgramada
                              : item.status === 'Completada'
                              ? styles.statusCompletada
                              : item.status === 'Cancelada'
                              ? styles.statusCancelada
                              : styles.statusReagendada
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.linkCell}>
                          {item.status === 'Cancelada' || item.status === 'Reagendada' ? (
                            <span className="text-slate-400 italic text-sm">No aplica</span>
                          ) : item.link ? (
                            <>
                              <CameraIcon />
                              <button
                                className={styles.btnEditLink}
                                onClick={() => handleOpenModal(item)}
                              >
                                📝 Editar
                              </button>
                            </>
                          ) : (
                            <button
                              className={styles.btnAddLink}
                              onClick={() => handleOpenModal(item)}
                            >
                              Agregar Enlace
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                           <button 
                             className={styles.btnActionDetail}
                             onClick={() => {
                               setSelectedDetailInterview(item);
                               setIsDetailModalOpen(true);
                               loadStudentProfile(item.studentEmail);
                               setShowCVDetails(false);
                             }}
                           >
                            👁 Ver Detalle
                            </button>
                          {item.status === 'Programada' && (
                            <button
                              className={styles.btnActionFeedback}
                              onClick={() => handleOpenReschedule(item)}
                            >
                              🔄 Reprogramar
                            </button>
                          )}
                          {item.status === 'Completada' && (
                            <button className={styles.btnActionFeedback}>
                              📄 Feedback
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No se encontraron entrevistas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* VIRTUAL MEETING LINK EDIT/ADD MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={() => setIsModalOpen(false)}>
              &times;
            </button>

            <h2 className={styles.modalTitle}>Enlace de Entrevista Virtual</h2>
            <p className={styles.modalDescription}>
              Registra o actualiza el enlace de Google Meet/Zoom para esta entrevista
            </p>

            <div className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="meeting-link">Enlace de Reunión</label>
                <input
                  id="meeting-link"
                  type="text"
                  placeholder="https://meet.google.com/..."
                  className={styles.modalInput}
                  value={meetingLinkInput}
                  onChange={(e) => setMeetingLinkInput(e.target.value)}
                  autoFocus
                />
                <span className={styles.inputSubtext}>
                  El enlace será enviado automáticamente al correo del estudiante
                </span>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button className={styles.btnSubmit} onClick={handleSaveLink}>
                  Guardar y Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedDetailInterview && (
        <div 
          className={styles.modalOverlay} 
          onClick={() => {
            setIsDetailModalOpen(false);
            setIsProfileModalOpen(false);
          }}
        >
          <div className={`${styles.modalContent} ${styles.modalContentDetail}`} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.modalCloseButton} 
              onClick={() => {
                setIsDetailModalOpen(false);
                setIsProfileModalOpen(false);
              }}
            >
              &times;
            </button>

            {isProfileModalOpen ? (
              <div>
                {/* Cabecera */}
                <div className="flex items-center pb-5 mb-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="text-left">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#7447D7] dark:text-purple-400 block mb-0.5">Perfil del Estudiante</span>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{selectedDetailInterview.studentName}</h2>
                  </div>
                </div>

                {/* Contenido Desplazable del Perfil */}
                <div className="space-y-6">
                  {loadingProfile ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7447D7] border-t-transparent"></div>
                      <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Cargando perfil detallado del estudiante...</p>
                    </div>
                  ) : selectedStudentProfile ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                      {/* Columna Izquierda: Información de contacto y competencias */}
                      <div className="space-y-6 lg:col-span-1">
                        {/* Información de Contacto */}
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/10 space-y-3">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-2">Información de Contacto</h3>
                          
                          <div className="text-sm space-y-2 text-slate-600 dark:text-slate-300">
                            <p><strong>Correo:</strong> <span className="block font-bold text-slate-800 dark:text-slate-200 break-all">{selectedStudentProfile.correoContacto || selectedDetailInterview.studentEmail}</span></p>
                            <p><strong>Celular:</strong> <span className="block font-bold text-slate-800 dark:text-slate-200">{selectedStudentProfile.celular || 'No registrado'}</span></p>
                            <p><strong>Ubicación:</strong> <span className="block font-bold text-slate-800 dark:text-slate-200">{selectedStudentProfile.distrito || ''}{selectedStudentProfile.distrito && selectedStudentProfile.provincia ? ', ' : ''}{selectedStudentProfile.provincia || 'No registrada'}</span></p>
                            {selectedStudentProfile.linkedinUrl && (
                              <p>
                                <strong>LinkedIn:</strong> 
                                <a 
                                  href={selectedStudentProfile.linkedinUrl.startsWith("http") ? selectedStudentProfile.linkedinUrl : `https://${selectedStudentProfile.linkedinUrl}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="block text-[#7447D7] dark:text-purple-400 hover:underline truncate font-bold"
                                >
                                  {selectedStudentProfile.linkedinUrl}
                                </a>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Competencias */}
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/10 space-y-4">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-2">Competencias</h3>
                          
                          {selectedStudentProfile.habilidades && selectedStudentProfile.habilidades.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Habilidades</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedStudentProfile.habilidades.map((h: any, idx: number) => (
                                  <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg">
                                    {h.nombre} • <span className="text-[10px] opacity-80">{h.nivel}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedStudentProfile.herramientas && selectedStudentProfile.herramientas.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Herramientas</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedStudentProfile.herramientas.map((h: any, idx: number) => (
                                  <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg">
                                    {h.nombre} • <span className="text-[10px] opacity-80">{h.nivel}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedStudentProfile.idiomas && selectedStudentProfile.idiomas.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Idiomas</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedStudentProfile.idiomas.map((h: any, idx: number) => (
                                  <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg">
                                    {h.nombre} • <span className="text-[10px] opacity-80">{h.nivel}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Columna Derecha: Bio, Experiencia, Educación */}
                      <div className="space-y-6 lg:col-span-2">
                        {/* Perfil Profesional */}
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 bg-slate-50/30 dark:bg-slate-900/50 space-y-3 shadow-sm">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Perfil Profesional</h3>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                            {selectedStudentProfile.perfilProfesional || 'Sin descripción profesional registrada.'}
                          </p>
                        </div>

                        {/* Experiencia Laboral */}
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 bg-slate-50/30 dark:bg-slate-900/50 space-y-4 shadow-sm">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-2">Experiencia Laboral</h3>
                          {selectedStudentProfile.experiencias && selectedStudentProfile.experiencias.length > 0 ? (
                            <div className="space-y-4">
                              {selectedStudentProfile.experiencias.map((exp: any, idx: number) => (
                                <div key={idx} className="relative pl-4 border-l-2 border-purple-200 dark:border-purple-800 space-y-1">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{exp.cargo} <span className="font-normal text-slate-500">en</span> {exp.empresa}</h4>
                                    <span className="text-xs font-semibold text-slate-400 mt-1 sm:mt-0">{exp.fechaInicio} - {exp.fechaFin || 'Presente'}</span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">{exp.funcionesRealizadas}</p>
                                  {exp.logrosResultados && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold italic mt-1">Logros: {exp.logrosResultados}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No ha registrado experiencia laboral.</p>
                          )}
                        </div>

                        {/* Educación */}
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 bg-slate-50/30 dark:bg-slate-900/50 space-y-4 shadow-sm">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-2">Formación Académica</h3>
                          {selectedStudentProfile.formaciones && selectedStudentProfile.formaciones.length > 0 ? (
                            <div className="space-y-4">
                              {selectedStudentProfile.formaciones.map((edu: any, idx: number) => (
                                <div key={idx} className="relative pl-4 border-l-2 border-blue-200 dark:border-blue-800 space-y-1">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{edu.carrera}</h4>
                                    <span className="text-xs font-semibold text-slate-400 mt-1 sm:mt-0">{edu.fechaInicio} - {edu.fechaFin || 'En curso'}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{edu.institucion}</p>
                                  {edu.cursosRelevantes && edu.cursosRelevantes.length > 0 && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                      <strong>Cursos relevantes:</strong> {Array.isArray(edu.cursosRelevantes) ? edu.cursosRelevantes.join(', ') : edu.cursosRelevantes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No ha registrado formación académica.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-12">No se pudo cargar la información del perfil del estudiante.</p>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                  <button 
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex h-11 px-5 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition text-sm cursor-pointer"
                  >
                    Volver
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className={styles.modalTitle}>Detalle de Entrevista</h2>
                <p className={styles.modalDescription}>
                  Información completa de la entrevista programada
                </p>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Estudiante</span>
                    <span className={styles.infoValue}>
                      <UserIcon /> {selectedDetailInterview.studentName}
                    </span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>
                      {selectedDetailInterview.studentEmail}
                    </span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fecha y Hora</span>
                    <span className={styles.infoValue}>
                      <ClockIcon /> {selectedDetailInterview.date} - {selectedDetailInterview.time}
                      {selectedDetailInterview.status === 'Programada' && (
                        <button
                          className={styles.btnRescheduleInline}
                          onClick={() => {
                            handleOpenReschedule(selectedDetailInterview);
                            setIsDetailModalOpen(false);
                          }}
                        >
                          🔄 Reprogramar
                        </button>
                      )}
                    </span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Estado</span>
                    <span className={styles.infoValue}>
                      <span
                        className={`${styles.statusBadge} ${
                          selectedDetailInterview.status === 'Programada'
                            ? styles.statusProgramada
                            : selectedDetailInterview.status === 'Completada'
                            ? styles.statusCompletada
                            : selectedDetailInterview.status === 'Cancelada'
                            ? styles.statusCancelada
                            : styles.statusReagendada
                        }`}
                      >
                        {selectedDetailInterview.status}
                      </span>
                    </span>
                  </div>
                </div>

                {(selectedDetailInterview.status === 'Cancelada' || selectedDetailInterview.status === 'Reagendada') && selectedDetailInterview.motivoCancelacion && (
                  <div className={styles.cancellationBox}>
                    <h4 className={styles.cancellationTitle}>
                      Motivo de {selectedDetailInterview.status === 'Cancelada' ? 'Cancelación' : 'Reagendación'}
                    </h4>
                    <p className={styles.cancellationText}>
                      "{selectedDetailInterview.motivoCancelacion}"
                    </p>
                  </div>
                )}

                <div className={styles.meetingLinkSection}>
                  <h3 className={styles.sectionHeader}>
                    <VideoIcon /> Enlace de Reunión
                  </h3>
                  {selectedDetailInterview.link ? (
                    <div className={styles.linkBox}>
                      {selectedDetailInterview.link}
                    </div>
                  ) : (
                    <div className={styles.noLinkBox}>
                      Enlace no registrado
                    </div>
                  )}
                </div>

                <div className={styles.cardsGrid}>
                  <div className={styles.detailCard}>
                    <h3 className={styles.sectionHeader}>
                      <DocumentIcon /> CV del Estudiante
                    </h3>
                    <div className={styles.detailCardText}>
                      {selectedDetailInterview.cvAvailable ? 'CV disponible' : 'CV no registrado'}
                    </div>
                    <button 
                      className={styles.btnCardAction} 
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        loadStudentProfile(selectedDetailInterview.studentEmail);
                      }}
                    >
                      Ver perfil
                    </button>
                    {selectedDetailInterview.cvAvailable ? (
                      <div className="flex gap-2 w-full mt-2">
                        <button 
                          className={styles.btnCardAction}
                          style={{ backgroundColor: '#643781', color: 'white', flex: 1 }}
                          onClick={() => {
                            try {
                              viewCV(selectedDetailInterview.studentEmail);
                            } catch (err) {
                              toast.error("No se pudo abrir el CV");
                            }
                          }}
                        >
                          Ver CV subido
                        </button>
                        <button 
                          className={styles.btnCardAction}
                          style={{ backgroundColor: '#0E3E66', color: 'white', flex: 1 }}
                          onClick={() => downloadCV(selectedDetailInterview.studentEmail, selectedDetailInterview.studentName)}
                        >
                          Descargar CV subido
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-2 rounded-xl mt-2 font-bold text-center">
                        ⚠️ El estudiante no ha subido su archivo de CV en PDF
                      </div>
                    )}
                  </div>

                  <div className={styles.detailCard}>
                    <h3 className={styles.sectionHeader}>
                      <ChartIcon /> Resultado DISC
                    </h3>
                    <div className={styles.detailCardText}>
                      {selectedDetailInterview.discResult || 'No disponible'}
                    </div>
                    <button 
                      className={styles.btnCardAction} 
                      disabled={!selectedDetailInterview.discResult}
                      onClick={() => {
                        setShowDISCDetails(!showDISCDetails);
                        if (!selectedStudentDISC && selectedDetailInterview.idEstudiante) {
                          loadStudentDISC(selectedDetailInterview.idEstudiante);
                        }
                      }}
                    >
                      {showDISCDetails ? 'Ocultar Análisis' : 'Ver Análisis Completo'}
                    </button>
                  </div>
                </div>

                {/* DETAILED PANELS GRID */}
                {(showCVDetails || showDISCDetails) && (
                  <div className={styles.panelsGrid}>
                    {/* CV DETAILED PANEL */}
                    {showCVDetails && (
                      <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: '400px', overflowY: 'auto' }}>
                        {loadingProfile ? (
                          <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando perfil del estudiante...</p>
                        ) : selectedStudentProfile ? (
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>Perfil Profesional</h3>
                            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '5px' }}><strong>Contacto:</strong> {selectedStudentProfile.celular || 'No registrado'} | {selectedStudentProfile.correoContacto || 'No registrado'}</p>
                            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '5px' }}><strong>Ubicación:</strong> {selectedStudentProfile.distrito || ''}, {selectedStudentProfile.provincia || ''}</p>
                            {selectedStudentProfile.linkedinUrl && (
                              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                                <strong>LinkedIn:</strong> <a href={selectedStudentProfile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{selectedStudentProfile.linkedinUrl}</a>
                              </p>
                            )}
                            <p style={{ fontSize: '13px', color: '#475569', whiteSpace: 'pre-wrap', backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #f1f5f9', marginTop: '10px' }}>
                              {selectedStudentProfile.perfilProfesional || 'Sin descripción profesional registrada.'}
                            </p>

                            {selectedStudentProfile.experiencias && selectedStudentProfile.experiencias.length > 0 && (
                              <div style={{ marginTop: '15px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>Experiencia Laboral</h4>
                                {selectedStudentProfile.experiencias.map((exp: any, idx: number) => (
                                  <div key={idx} style={{ marginBottom: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'between', fontWeight: 'bold', color: '#334155' }}>
                                      <span>{exp.cargo}</span>
                                      <span style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>
                                      <span>{exp.empresa}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{exp.fechaInicio} - {exp.fechaFin || 'Presente'}</div>
                                    <p style={{ color: '#475569', margin: 0 }}>{exp.funcionesRealizadas}</p>
                                    {exp.logrosResultados && <p style={{ color: '#475569', fontSize: '12px', fontStyle: 'italic', margin: 0 }}>Logros: {exp.logrosResultados}</p>}
                                  </div>
                                ))}
                              </div>
                            )}

                            {selectedStudentProfile.formaciones && selectedStudentProfile.formaciones.length > 0 && (
                              <div style={{ marginTop: '15px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>Educación</h4>
                                {selectedStudentProfile.formaciones.map((edu: any, idx: number) => (
                                  <div key={idx} style={{ marginBottom: '10px', fontSize: '13px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#334155' }}>{edu.carrera}</div>
                                    <div style={{ color: '#475569' }}>{edu.institucion}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{edu.fechaInicio} - {edu.fechaFin || 'En curso'}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {selectedStudentProfile.habilidades && selectedStudentProfile.habilidades.length > 0 && (
                              <div style={{ marginTop: '15px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Habilidades</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {selectedStudentProfile.habilidades.map((hab: any, idx: number) => (
                                    <span key={idx} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: '500' }}>
                                      {hab.nombre} ({hab.nivel})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p style={{ textAlign: 'center', color: '#64748b' }}>No se pudo cargar el perfil del estudiante.</p>
                        )}
                      </div>
                    )}

                    {/* DISC DETAILED PANEL */}
                    {showDISCDetails && (
                      <div style={{ padding: '20px', backgroundColor: '#faf5ff', borderRadius: '12px', border: '1px solid #f3e8ff', maxHeight: '400px', overflowY: 'auto' }}>
                        {loadingDISC ? (
                          <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando análisis DISC...</p>
                        ) : selectedStudentDISC ? (
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#6b21a8', marginBottom: '5px' }}>
                              Análisis DISC: {selectedStudentDISC.nombrePerfil} (Dominancia: {selectedStudentDISC.porcentajeD}%, Influencia: {selectedStudentDISC.porcentajeI}%, Estabilidad: {selectedStudentDISC.porcentajeS}%, Conciencia: {selectedStudentDISC.porcentajeC}%)
                            </h3>
                            <p style={{ fontSize: '13px', color: '#581c87', marginBottom: '15px', lineHeight: '1.5' }}>{selectedStudentDISC.descripcion}</p>

                            {/* BAR CHART SIMULATION */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                              {[
                                { label: 'D - Decisión', value: selectedStudentDISC.porcentajeD, color: '#ef4444' },
                                { label: 'I - Influencia', value: selectedStudentDISC.porcentajeI, color: '#eab308' },
                                { label: 'S - Estabilidad', value: selectedStudentDISC.porcentajeS, color: '#22c55e' },
                                { label: 'C - Cumplimiento', value: selectedStudentDISC.porcentajeC, color: '#3b82f6' }
                              ].map((item, idx) => (
                                <div key={idx} style={{ fontSize: '12px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '3px' }}>
                                    <span style={{ fontWeight: '500' }}>{item.label}</span>
                                    <span>{item.value}%</span>
                                  </div>
                                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${item.value}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px' }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {selectedStudentDISC.fortalezas && selectedStudentDISC.fortalezas.length > 0 && (
                              <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#6b21a8', marginBottom: '6px' }}>Fortalezas Clave</h4>
                                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#4a044e', lineHeight: '1.4' }}>
                                  {selectedStudentDISC.fortalezas.map((fort: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: '4px' }}>{fort}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p style={{ textAlign: 'center', color: '#64748b' }}>No se pudo cargar el análisis DISC del estudiante.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {isRescheduleModalOpen && rescheduleInterview && (
        <div className={styles.modalOverlay} onClick={() => setIsRescheduleModalOpen(false)}>
          <div className={`${styles.modalContent} ${styles.rescheduleContent}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={() => setIsRescheduleModalOpen(false)}>
              &times;
            </button>

            <h2 className={styles.modalTitle}>Reprogramar Entrevista</h2>
            <p className={styles.modalDescription}>
              Selecciona una nueva fecha y hora para la entrevista con <strong>{rescheduleInterview.studentName}</strong>
            </p>

            {/* Current Appointment */}
            <div className={styles.rescheduleCurrentCard}>
              <div className={styles.rescheduleCardLabel}>Cita Actual</div>
              <div className={styles.rescheduleCardRow}>
                <svg className={styles.rescheduleCardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{rescheduleInterview.date}</span>
                <span className={styles.rescheduleArrow}>|</span>
                <svg className={styles.rescheduleCardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{rescheduleInterview.time}</span>
              </div>
            </div>

            {/* Weekly Calendar */}
            <div className={styles.calendarSection}>
              <div className={styles.calendarSectionTitle}>Nueva Fecha</div>
              <div className={styles.weekNav}>
                <button className={styles.weekNavBtn} onClick={() => setWeekOffset(weekOffset - 1)}>◀</button>
                <span className={styles.weekNavTitle}>{formatWeekRange(weekDates)}</span>
                <button className={styles.weekNavBtn} onClick={() => setWeekOffset(weekOffset + 1)}>▶</button>
              </div>
              <div className={styles.weekContainer}>
                <div className={styles.weekTimeCol}>
                  <div className={styles.weekTimeHeader}>Hora</div>
                  {RESCHEDULE_HOURS.map(h => (
                    <div key={h} className={styles.weekHourLabel}>{`${String(h).padStart(2, '0')}:00`}</div>
                  ))}
                </div>
                {weekDates.map((date, idx) => {
                  const dayIndex = date.getDay();
                  const dayName = DAYS_SHORT[dayIndex === 0 ? 6 : dayIndex - 1];
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isPast = date < today;
                  const isToday = date.getTime() === today.getTime();
                  const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                  const hasAvailability = isDayAvailable(date);
                  const blocks = getBlocksForDay(date);

                  return (
                    <div key={idx} className={styles.weekDayCol}>
                      <div className={`${styles.weekDayColHeader} ${isToday ? styles.weekDayToday : ''} ${hasAvailability ? styles.weekDayColHeaderAvail : ''}`}>
                        <span className={styles.weekDayName}>{dayName}</span>
                        <span className={styles.weekDayNum}>{date.getDate()}</span>
                      </div>
                      <div className={styles.weekDayColBody}>
                        {RESCHEDULE_HOURS.map(h => {
                          const timeStr = `${String(h).padStart(2, '0')}:00`;
                          return (
                            <div
                              key={h}
                              className={`${styles.weekHourLine} ${isPast ? styles.weekHourLineDisabled : ''}`}
                              onClick={() => {
                                if (!isPast) {
                                  setSelectedDate(date);
                                  setSelectedTime(timeStr);
                                  setManualTimeInput(timeStr);
                                }
                              }}
                            />
                          );
                        })}
                        {blocks.map(block => {
                          const top = rescheduleTimeToY(block.horaInicio);
                          const height = Math.max(rescheduleTimeToY(block.horaFin) - top, 8);
                          const isBlockSelected = isSelected && selectedTime === block.horaInicio;
                          return (
                            <div
                              key={block.idDisponibilidad}
                              className={`${styles.weekBlock} ${isBlockSelected ? styles.weekBlockSelected : ''}`}
                              style={{ top, height }}
                              onClick={() => {
                                if (!isPast) {
                                  setSelectedDate(date);
                                  setSelectedTime(block.horaInicio);
                                  setManualTimeInput(block.horaInicio);
                                }
                              }}
                            >
                              <span className={styles.weekBlockTime}>{block.horaInicio}</span>
                              <span className={styles.weekBlockType}>{block.tipoEntrevista}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {loadingAvailability && (
                <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
                  Cargando disponibilidad...
                </p>
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className={styles.timeSection}>
                <div className={styles.timeSectionTitle}>Nueva Hora</div>
                {(() => {
                  const dayOfWeek = selectedDate.getDay();
                  const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
                  const hasAvailability = availableDays.includes(dayNames[dayOfWeek]);

                  if (hasAvailability) {
                    const slots = generateSlotsForDate(selectedDate);
                    return (
                      <>
                        <p className={styles.timeHelperText}>
                          Tienes bloques de disponibilidad registrados para este día. Selecciona un horario o ingresa uno manualmente.
                        </p>
                        {slots.length > 0 && (
                          <div className={styles.timeSlotGrid}>
                            {slots.map(slot => (
                              <button
                                key={slot}
                                className={`${styles.timeSlotBtn} ${selectedTime === slot ? styles.timeSlotBtnSelected : ''}`}
                                onClick={() => {
                                  setSelectedTime(slot);
                                  setManualTimeInput(slot);
                                }}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  }

                  return (
                    <p className={styles.timeHelperText}>
                      No tienes bloques de disponibilidad registrados para este día. Ingresa la hora manualmente.
                    </p>
                  );
                })()}
                <div className={styles.timeManualLabel}>O ingresa la hora manualmente</div>
                <input
                  type="text"
                  className={styles.timeManualInput}
                  placeholder="HH:MM (ej. 14:00)"
                  value={manualTimeInput}
                  onChange={(e) => {
                    setManualTimeInput(e.target.value);
                    setSelectedTime(e.target.value);
                  }}
                />
              </div>
            )}

            {/* Summary */}
            {selectedDate && selectedTime && (
              <div className={styles.rescheduleSummaryCard}>
                <div className={styles.rescheduleSummaryLabel}>Nueva Cita</div>
                <div className={styles.rescheduleCardRow}>
                  <svg className={styles.rescheduleCardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>
                    {`${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}`}
                  </span>
                  <span className={styles.rescheduleArrow}>|</span>
                  <svg className={styles.rescheduleCardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{selectedTime}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setIsRescheduleModalOpen(false)}>
                Cancelar
              </button>
              <button
                className={styles.btnSubmit}
                disabled={!selectedDate || !selectedTime || submittingReschedule}
                onClick={handleConfirmReschedule}
              >
                {submittingReschedule ? 'Reprogramando...' : 'Confirmar Reprogramación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
