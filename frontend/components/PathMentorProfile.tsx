'use client';

import { useState } from 'react';
import PathMentorNavbar from './PathMentorNavbar';
import PathMentorTopbar from './PathMentorTopbar';
import styles from '../styles/PathMentorProfile.module.css';

// SVG Icons
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const AwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

interface Certification {
  title: string;
  issuer: string;
  year: string;
}

export default function PathMentorProfile() {
  const [isEditing, setIsEditing] = useState(false);

  // Profile text states
  const [name, setName] = useState('Dr. Roberto Martínez');
  const [role, setRole] = useState('PathMentor Senior - Tecnología');
  const [email, setEmail] = useState('roberto.martinez@pathfinder.com');
  const [phone, setPhone] = useState('+52 55 1234 5678');
  const [location, setLocation] = useState('Ciudad de México, México');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/roberto-martinez');
  const [bio, setBio] = useState(
    'PathMentor con más de 10 años de experiencia en tecnología y desarrollo de talento. Especializado en entrevistas técnicas para roles de desarrollo de software, UX/UI y ciencia de datos. Apasionado por ayudar a estudiantes a alcanzar su máximo potencial profesional.'
  );
  const [expertise, setExpertise] = useState('Desarrollo de Software, UX/UI, Ciencia de Datos');
  const [languages, setLanguages] = useState('Español (Nativo), Inglés (Fluido)');

  // Temporary edit states to support "Cancelar" without saving
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editExpertise, setEditExpertise] = useState('');
  const [editLanguages, setEditLanguages] = useState('');

  const handleStartEdit = () => {
    setEditName(name);
    setEditRole(role);
    setEditEmail(email);
    setEditPhone(phone);
    setEditLocation(location);
    setEditLinkedin(linkedin);
    setEditBio(bio);
    setEditExpertise(expertise);
    setEditLanguages(languages);
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    setName(editName);
    setRole(editRole);
    setEmail(editEmail);
    setPhone(editPhone);
    setLocation(editLocation);
    setLinkedin(editLinkedin);
    setBio(editBio);
    setExpertise(editExpertise);
    setLanguages(editLanguages);
    setIsEditing(false);
  };

  const certifications: Certification[] = [
    { title: 'Certified Technical Interviewer', issuer: 'Tech Interview Academy', year: '2024' },
    { title: 'Advanced UX/UI Evaluation', issuer: 'Design Institute', year: '2023' },
    { title: 'Data Science Assessment', issuer: 'Analytics Academy', year: '2022' },
  ];

  const specializations = [
    'Desarrollo Frontend (React, Vue, Angular)',
    'Desarrollo Backend (Node.js, Python, Java)',
    'Diseño UX/UI',
    'Ciencia de Datos y Machine Learning',
    'Arquitectura de Software',
    'Entrevistas Comportamentales',
  ];

  return (
    <div className={styles.page}>
      {/* SIDEBAR */}
      <PathMentorNavbar />

      {/* TOPBAR */}
      <PathMentorTopbar />

      {/* CONTENT */}
      <main className={styles.container}>
        {/* HEADER */}
        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <h1>Mi Perfil</h1>
            <p>Información personal y profesional</p>
          </div>
          {isEditing ? (
            <div>
              <button 
                className={styles.btnCancel}
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.btnSave}
                onClick={handleSaveChanges}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Guardar Cambios
              </button>
            </div>
          ) : (
            <button 
              className={styles.btnEdit}
              onClick={handleStartEdit}
            >
              <PencilIcon /> Editar Perfil
            </button>
          )}
        </div>

        {/* MAIN PROFILE DETAILS CARD */}
        <section className={styles.profileCard}>
          <div className={styles.profileAvatarContainer}>
            <div className={styles.profileAvatar}>
              {isEditing 
                ? (editName ? editName.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase() : 'RM')
                : (name ? name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase() : 'RM')
              }
            </div>
            {isEditing && (
              <button className={styles.btnChangePhoto}>
                Cambiar Foto
              </button>
            )}
          </div>
          
          <div className={styles.profileInfo} style={{ width: '100%' }}>
            {isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Nombre Completo</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Título / Cargo</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className={styles.profileName}>{name}</h2>
                <p className={styles.profileRole}>{role}</p>
                <div className={styles.badgeRow}>
                  <span className={styles.profileBadge}>
                    <span className={styles.profileBadgeIcon}><BriefcaseIcon /></span>
                    PathFinder
                  </span>
                  <span className={styles.profileBadge}>
                    <span className={styles.profileBadgeIcon}><MapPinIcon /></span>
                    {location}
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* METRICS ROW */}
        <section className={styles.metricsRow}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <CalendarIcon />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricVal}>74</span>
              <span className={styles.metricLabel}>Entrevistas Totales</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <AwardIcon />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricVal}>92%</span>
              <span className={styles.metricLabel}>Tasa de Aprobación</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <BriefcaseIcon />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricVal}>10+</span>
              <span className={styles.metricLabel}>Años de Experiencia</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <AwardIcon />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricVal}>4.3/5</span>
              <span className={styles.metricLabel}>Calificación Promedio</span>
            </div>
          </div>
        </section>

        {/* CONTACT INFO */}
        <section className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><UserIcon /></span>
            <span>Información de Contacto</span>
          </div>
          {isEditing ? (
            <div className={styles.cardGrid}>
              <div className={styles.cardCol}>
                <label className={styles.inputLabel}>Email</label>
                <input
                  type="email"
                  className={styles.inputField}
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className={styles.cardCol}>
                <label className={styles.inputLabel}>Teléfono</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div className={styles.cardCol}>
                <label className={styles.inputLabel}>Ubicación</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </div>
              <div className={styles.cardCol}>
                <label className={styles.inputLabel}>LinkedIn</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              <div className={styles.cardCol}>
                <span className={styles.cardLabel}>Email</span>
                <span className={styles.cardVal}>
                  <span className={styles.cardValIcon}><MailIcon /></span>
                  {email}
                </span>
              </div>
              <div className={styles.cardCol}>
                <span className={styles.cardLabel}>Teléfono</span>
                <span className={styles.cardVal}>
                  <span className={styles.cardValIcon}><PhoneIcon /></span>
                  {phone}
                </span>
              </div>
              <div className={styles.cardCol}>
                <span className={styles.cardLabel}>Ubicación</span>
                <span className={styles.cardVal}>
                  <span className={styles.cardValIcon}><MapPinIcon /></span>
                  {location}
                </span>
              </div>
              <div className={styles.cardCol}>
                <span className={styles.cardLabel}>LinkedIn</span>
                <span className={styles.cardVal}>
                  <span className={styles.cardValIcon}><GlobeIcon /></span>
                  <a
                    href={`https://${linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardLink}
                  >
                    {linkedin}
                  </a>
                </span>
              </div>
            </div>
          )}
        </section>

        {/* PROFESSIONAL INFO */}
        <section className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><BriefcaseIcon /></span>
            <span>Información Profesional</span>
          </div>
          {isEditing ? (
            <div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.inputLabel}>Biografía</label>
                <textarea
                  className={styles.textareaField}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                />
              </div>
              <div className={styles.cardGrid}>
                <div className={styles.cardCol}>
                  <label className={styles.inputLabel}>Áreas de Expertise</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editExpertise}
                    onChange={(e) => setEditExpertise(e.target.value)}
                  />
                </div>
                <div className={styles.cardCol}>
                  <label className={styles.inputLabel}>Idiomas</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editLanguages}
                    onChange={(e) => setEditLanguages(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <span className={styles.cardLabel} style={{ display: 'block', marginBottom: '8px' }}>Biografía</span>
              <p className={styles.cardText}>{bio}</p>
              <div className={styles.cardGrid}>
                <div className={styles.cardCol}>
                  <span className={styles.cardLabel}>Áreas de Expertise</span>
                  <span className={styles.cardVal}>{expertise}</span>
                </div>
                <div className={styles.cardCol}>
                  <span className={styles.cardLabel}>Idiomas</span>
                  <span className={styles.cardVal}>{languages}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SPECIALIZATIONS */}
        <section className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><TagIcon /></span>
            <span>Especializaciones</span>
          </div>
          <p className={styles.specSubHeader}>Áreas en las que puedes realizar entrevistas</p>
          <div className={styles.specializationList}>
            {specializations.map((spec, idx) => (
              <span key={idx} className={styles.specTag}>
                {spec}
              </span>
            ))}
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><AwardIcon /></span>
            <span>Certificaciones</span>
          </div>
          <div className={styles.certList}>
            {certifications.map((cert, idx) => (
              <div key={idx} className={styles.certRow}>
                <div className={styles.certBadgeIcon}>
                  <AwardIcon />
                </div>
                <div className={styles.certInfo}>
                  <span className={styles.certTitle}>{cert.title}</span>
                  <span className={styles.certIssuer}>{cert.issuer}</span>
                  <span className={styles.certYear}>{cert.year}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
