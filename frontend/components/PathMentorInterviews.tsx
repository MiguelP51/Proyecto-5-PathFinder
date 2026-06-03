'use client';

import { useState } from 'react';
import PathMentorNavbar from './PathMentorNavbar';
import PathMentorTopbar from './PathMentorTopbar';
import styles from '../styles/PathMentorInterviews.module.css';

interface Interview {
  id: number;
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
  // Mock data representing 24 total interviews (8 programadas, 16 completadas, 3 this week)
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: 1,
      studentName: 'María González',
      studentEmail: 'maria.gonzalez@email.com',
      date: '2026-06-03',
      time: '10:00',
      status: 'Programada',
      link: 'https://meet.google.com/abc-defg-hij',
      discResult: 'Dominancia: Alta, Influencia: Alta',
      cvAvailable: true
    },
    {
      id: 2,
      studentName: 'Carlos Pérez',
      studentEmail: 'carlos.perez@email.com',
      date: '2026-06-05',
      time: '15:00',
      status: 'Programada',
      link: 'https://meet.google.com/carlos-perez',
      discResult: 'Estabilidad: Alta, Conciencia: Media',
      cvAvailable: true
    },
    {
      id: 3,
      studentName: 'Ana Martínez',
      studentEmail: 'ana.martinez@email.com',
      date: '2026-05-28',
      time: '11:00',
      status: 'Completada',
      link: 'https://meet.google.com/tuv-wxyz-123',
      discResult: 'Conciencia: Alta, Dominancia: Baja',
      cvAvailable: true
    },
    {
      id: 4,
      studentName: 'Luis Torres',
      studentEmail: 'luis.torres@email.com',
      date: '2026-05-25',
      time: '14:00',
      status: 'Completada',
      discResult: 'Influencia: Alta, Dominancia: Media',
      cvAvailable: true
    },
    {
      id: 5,
      studentName: 'Sofia Ramírez',
      studentEmail: 'sofia.ramirez@email.com',
      date: '2026-06-03',
      time: '16:00',
      status: 'Programada',
      link: 'https://meet.google.com/sofia-ramirez'
    },
    {
      id: 6,
      studentName: 'Diego Torres',
      studentEmail: 'diego.torres@email.com',
      date: '2026-06-08',
      time: '09:00',
      status: 'Programada',
      link: 'https://meet.google.com/diego-torres'
    },
    {
      id: 7,
      studentName: 'Laura Gómez',
      studentEmail: 'laura.gomez@email.com',
      date: '2026-06-09',
      time: '11:00',
      status: 'Programada'
    },
    {
      id: 8,
      studentName: 'Javier Diaz',
      studentEmail: 'javier.diaz@email.com',
      date: '2026-06-10',
      time: '14:00',
      status: 'Programada'
    },
    {
      id: 9,
      studentName: 'Valentina Silva',
      studentEmail: 'valentina.silva@email.com',
      date: '2026-06-11',
      time: '10:00',
      status: 'Programada'
    },
    {
      id: 10,
      studentName: 'Mateo Ruiz',
      studentEmail: 'mateo.ruiz@email.com',
      date: '2026-06-12',
      time: '13:00',
      status: 'Programada'
    },
    {
      id: 11,
      studentName: 'Camila Herrera',
      studentEmail: 'camila.herrera@email.com',
      date: '2026-05-24',
      time: '16:00',
      status: 'Completada',
      link: 'https://meet.google.com/camila-herrera'
    },
    {
      id: 12,
      studentName: 'Nicolás Castro',
      studentEmail: 'nicolas.castro@email.com',
      date: '2026-05-22',
      time: '10:00',
      status: 'Completada',
      link: 'https://meet.google.com/nicolas-castro'
    },
    {
      id: 13,
      studentName: 'Isabella Mendoza',
      studentEmail: 'isabella.mendoza@email.com',
      date: '2026-05-20',
      time: '12:00',
      status: 'Completada'
    },
    {
      id: 14,
      studentName: 'Lucas Acosta',
      studentEmail: 'lucas.acosta@email.com',
      date: '2026-05-19',
      time: '15:00',
      status: 'Completada'
    },
    {
      id: 15,
      studentName: 'Emma Peña',
      studentEmail: 'emma.pena@email.com',
      date: '2026-05-18',
      time: '09:00',
      status: 'Completada',
      link: 'https://meet.google.com/emma-pena'
    },
    {
      id: 16,
      studentName: 'Bruno Ortega',
      studentEmail: 'bruno.ortega@email.com',
      date: '2026-05-15',
      time: '11:00',
      status: 'Completada',
      link: 'https://meet.google.com/bruno-ortega'
    },
    {
      id: 17,
      studentName: 'Martina Flores',
      studentEmail: 'martina.flores@email.com',
      date: '2026-05-14',
      time: '13:00',
      status: 'Completada'
    },
    {
      id: 18,
      studentName: 'Benjamín Vega',
      studentEmail: 'benjamin.vega@email.com',
      date: '2026-05-12',
      time: '16:00',
      status: 'Completada'
    },
    {
      id: 19,
      studentName: 'Lucía Romero',
      studentEmail: 'lucia.romero@email.com',
      date: '2026-05-11',
      time: '10:00',
      status: 'Completada',
      link: 'https://meet.google.com/lucia-romero'
    },
    {
      id: 20,
      studentName: 'Joaquín Molina',
      studentEmail: 'joaquin.molina@email.com',
      date: '2026-05-08',
      time: '14:00',
      status: 'Completada',
      link: 'https://meet.google.com/joaquin-molina'
    },
    {
      id: 21,
      studentName: 'Elena Delgado',
      studentEmail: 'elena.delgado@email.com',
      date: '2026-05-07',
      time: '11:00',
      status: 'Completada'
    },
    {
      id: 22,
      studentName: 'Samuel Rojas',
      studentEmail: 'samuel.rojas@email.com',
      date: '2026-05-06',
      time: '15:00',
      status: 'Completada'
    },
    {
      id: 23,
      studentName: 'Victoria Cruz',
      studentEmail: 'victoria.cruz@email.com',
      date: '2026-05-05',
      time: '09:00',
      status: 'Completada',
      link: 'https://meet.google.com/victoria-cruz'
    },
    {
      id: 24,
      studentName: 'Daniel Fuentes',
      studentEmail: 'daniel.fuentes@email.com',
      date: '2026-05-04',
      time: '13:00',
      status: 'Completada'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeInterviewId, setActiveInterviewId] = useState<number | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');

  // Detail Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailInterview, setSelectedDetailInterview] = useState<Interview | null>(null);

  // Calculate Metrics Card Values Dynamically
  const totalCount = interviews.length;
  const programmedCount = interviews.filter((item) => item.status === 'Programada').length;
  const completedCount = interviews.filter((item) => item.status === 'Completada').length;

  // This Week matches June 1st to June 7th 2026
  const thisWeekCount = interviews.filter((item) => {
    const dateObj = new Date(item.date);
    // Month is 0-indexed: May is 4, June is 5
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

  const handleSaveLink = () => {
    if (activeInterviewId !== null) {
      setInterviews(
        interviews.map((item) =>
          item.id === activeInterviewId
            ? { ...item, link: meetingLinkInput.trim() || undefined }
            : item
        )
      );
    }
    setIsModalOpen(false);
  };

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
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
                <button className={styles.btnCardAction} disabled={!selectedDetailInterview.cvAvailable}>
                  Ver CV Completo
                </button>
              </div>

              <div className={styles.detailCard}>
                <h3 className={styles.sectionHeader}>
                  <ChartIcon /> Resultado DISC
                </h3>
                <div className={styles.detailCardText}>
                  {selectedDetailInterview.discResult || 'No disponible'}
                </div>
                <button className={styles.btnCardAction} disabled={!selectedDetailInterview.discResult}>
                  Ver Análisis Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
