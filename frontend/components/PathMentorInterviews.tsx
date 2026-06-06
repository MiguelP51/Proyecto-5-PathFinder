'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  status: 'Programada' | 'Completada';
  link?: string;
  discResult?: string;
  cvAvailable?: boolean;
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
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');

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

  // Student DISC detail view states
  const [selectedStudentDISC, setSelectedStudentDISC] = useState<any | null>(null);
  const [loadingDISC, setLoadingDISC] = useState(false);
  const [showDISCDetails, setShowDISCDetails] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.backendJwt) {
      loadInterviews();
    }
  }, [status, session]);

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
        cvAvailable: item.cvAvailable
      }));
      setInterviews(mapped);
    } catch (err) {
      console.error("Error cargando entrevistas:", err);
    } finally {
      setLoading(false);
    }
  };

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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
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


  // Calculate Metrics Card Values Dynamically
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

  // Filtered interviews list
  const filteredInterviews = interviews.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'Todas' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Modal Action Handlers
  const handleOpenModal = (interview: Interview) => {
    setActiveInterviewId(interview.id);
    setMeetingLinkInput(interview.link || '');
    setIsModalOpen(true);
  };

  const handleSaveLink = async () => {
    if (activeInterviewId !== null && session?.backendJwt) {
      try {
        await apiFetch(`/api/entrevistas/${activeInterviewId}/enlace`, {
          method: "PUT",
          body: JSON.stringify({ virtualLink: meetingLinkInput.trim() })
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
      {/* CONTENT */}
      <main className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h1>Mis Entrevistas</h1>
          <p>Gestiona tus entrevistas programadas y completa el feedback</p>
        </div>

        {/* SUMMARY METRICS */}
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
                <option value="Todas">Todas</option>
                <option value="Programada">Programada</option>
                <option value="Completada">Completada</option>
              </select>
            </div>
          </div>
        </section>

        {/* INTERVIEW LIST TABLE */}
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
                              : styles.statusCompletada
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.linkCell}>
                          {item.link ? (
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
        <div className={styles.modalOverlay} onClick={() => setIsDetailModalOpen(false)}>
          <div className={`${styles.modalContent} ${styles.modalContentDetail}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={() => setIsDetailModalOpen(false)}>
              &times;
            </button>

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
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Estado</span>
                <span className={styles.infoValue}>
                  <span
                    className={`${styles.statusBadge} ${
                      selectedDetailInterview.status === 'Programada'
                        ? styles.statusProgramada
                        : styles.statusCompletada
                    }`}
                  >
                    {selectedDetailInterview.status}
                  </span>
                </span>
              </div>
            </div>

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
                   disabled={!selectedDetailInterview.cvAvailable}
                   onClick={() => setShowCVDetails(!showCVDetails)}
                 >
                   {showCVDetails ? 'Ocultar CV' : 'Ver CV Completo'}
                 </button>
                 {selectedDetailInterview.cvAvailable && (
                   <div className="flex gap-2 w-full">
                     <button 
                       className={styles.btnCardAction}
                       style={{ marginTop: '8px', backgroundColor: '#643781', color: 'white', flex: 1 }}
                       onClick={() => {
                         try {
                           viewCV(selectedDetailInterview.studentEmail);
                         } catch (err) {
                           toast.error("No se pudo abrir el CV");
                         }
                       }}
                     >
                       Ver PDF
                     </button>
                     <button 
                       className={styles.btnCardAction}
                       style={{ marginTop: '8px', backgroundColor: '#0E3E66', color: 'white', flex: 1 }}
                       onClick={() => downloadCV(selectedDetailInterview.studentEmail, selectedDetailInterview.studentName)}
                     >
                       Descargar PDF
                     </button>
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
        </div>
      )}
    </div>
  );
}
