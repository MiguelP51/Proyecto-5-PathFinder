'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import styles from '../styles/PathMentorProfile.module.css';

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

interface ProfileData {
  nombreCompleto: string;
  correo: string;
  avatarUrl?: string;
  titulo?: string;
  telefono?: string;
  ubicacion?: string;
  linkedinUrl?: string;
  bio?: string;
  areasExpertise: AreaExpertiseItem[];
  certificaciones: CertificacionItem[];
  especialidades: string[];
  metrics: MentorMetrics;
}

interface AreaExpertiseItem {
  id?: number;
  nombre: string;
  aniosExperiencia: number;
}

interface CertificacionItem {
  id?: number;
  titulo: string;
  emisor: string;
  anio: string;
}

interface MentorMetrics {
  totalEntrevistas: number;
  tasaAprobacion: number;
  calificacionPromedio: number;
  aniosExperiencia: number;
}

export default function PathMentorProfile() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    nombreCompleto: '',
    correo: '',
    titulo: '',
    telefono: '',
    ubicacion: '',
    linkedinUrl: '',
    bio: '',
    areasExpertise: [],
    certificaciones: [],
    especialidades: [],
    metrics: { totalEntrevistas: 0, tasaAprobacion: 0, calificacionPromedio: 0, aniosExperiencia: 0 },
  });

  const [editFields, setEditFields] = useState(profile);

  useEffect(() => {
    if (!session?.backendJwt) return;
    setLoading(true);
    apiFetch<ProfileData>('/api/mentor/profile', {}, session.backendJwt)
      .then((data) => {
        setProfile(data);
        setEditFields(data);
      })
      .catch(() => {
        setProfile((prev) => ({
          ...prev,
          nombreCompleto: session?.user?.name || '',
          correo: session?.user?.email || '',
        }));
        setEditFields((prev) => ({
          ...prev,
          nombreCompleto: session?.user?.name || '',
          correo: session?.user?.email || '',
        }));
      })
      .finally(() => setLoading(false));
  }, [session]);

  const handleStartEdit = () => {
    setEditFields(profile);
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    if (!session?.backendJwt) return;
    setSaving(true);
    try {
      const updated = await apiFetch<ProfileData>('/api/mentor/profile', {
        method: 'PUT',
        body: JSON.stringify({
          titulo: editFields.titulo,
          telefono: editFields.telefono,
          ubicacion: editFields.ubicacion,
          linkedinUrl: editFields.linkedinUrl,
          bio: editFields.bio,
          areasExpertise: editFields.areasExpertise.map((a) => ({ nombre: a.nombre, aniosExperiencia: a.aniosExperiencia })),
          certificaciones: editFields.certificaciones,
          especialidades: editFields.especialidades.map((nombre) => ({ nombre })),
        }),
      }, session.backendJwt);
      setProfile(updated);
      setEditFields(updated);
      setIsEditing(false);
    } catch (e) {
      console.error('Error saving profile:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', color: '#7447D7' }} />
          <p style={{ color: '#64748b', fontWeight: '500' }}>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const p = isEditing ? editFields : profile;
  const metrics = profile.metrics;

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <h1>Mi Perfil</h1>
            <p>Información Personal y Profesional</p>
          </div>
          {isEditing ? (
            <div>
              <button className={styles.btnCancel} onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
              <button className={styles.btnSave} onClick={handleSaveChanges} disabled={saving}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          ) : (
            <button className={styles.btnEdit} onClick={handleStartEdit}>
              <PencilIcon /> Editar Perfil
            </button>
          )}
        </div>

        <section className={styles.profileCard}>
          <div className={styles.profileAvatarContainer}>
            <div className={styles.profileAvatar}>
              {(p.nombreCompleto ? p.nombreCompleto : 'M').split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div className={styles.profileInfo} style={{ width: '100%' }}>
            {isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Nombre Completo</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editFields.nombreCompleto}
                    onChange={(e) => setEditFields({ ...editFields, nombreCompleto: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Título / Cargo</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editFields.titulo || ''}
                    onChange={(e) => setEditFields({ ...editFields, titulo: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className={styles.profileName}>{p.nombreCompleto}</h2>
                <p className={styles.profileRole}>{p.titulo || 'PathMentor'}</p>
                <div className={styles.badgeRow}>
                  <span className={styles.profileBadge}>
                    <span className={styles.profileBadgeIcon}><BriefcaseIcon /></span>
                    PathFinder
                  </span>
                  {p.ubicacion && (
                    <span className={styles.profileBadge}>
                      <span className={styles.profileBadgeIcon}><MapPinIcon /></span>
                      {p.ubicacion}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <section className={styles.metricsRow}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}><CalendarIcon /></div>
            <div className={styles.metricInfo}>
              <span className={styles.metricVal}>{metrics.totalEntrevistas}</span>
              <span className={styles.metricLabel}>Entrevistas Totales</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}><AwardIcon /></div>
            <div className={styles.metricInfo}>
              <span className={styles.metricVal}>{metrics.tasaAprobacion}%</span>
              <span className={styles.metricLabel}>Tasa de Aprobación</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}><BriefcaseIcon /></div>
            <div className={styles.metricInfo}>
              <span className={styles.metricVal}>{metrics.aniosExperiencia}+</span>
              <span className={styles.metricLabel}>Años de Experiencia</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}><AwardIcon /></div>
            <div className={styles.metricInfo}>
              <span className={styles.metricVal}>{metrics.calificacionPromedio}/5</span>
              <span className={styles.metricLabel}>Calificación Promedio</span>
            </div>
          </div>
        </section>

        <section className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><UserIcon /></span>
            <span>Información de Contacto</span>
          </div>
          {isEditing ? (
            <div className={styles.cardGrid}>
              <div className={styles.cardCol}>
                <label className={styles.inputLabel}>Email</label>
                <input type="email" className={styles.inputField} value={editFields.correo} disabled />
              </div>
              <div className={styles.cardCol}>
                <label className={styles.inputLabel}>Teléfono</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editFields.telefono || ''}
                  onChange={(e) => setEditFields({ ...editFields, telefono: e.target.value })}
                />
              </div>
              <div className={styles.cardCol}>
                <label className={styles.inputLabel}>Ubicación</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editFields.ubicacion || ''}
                  onChange={(e) => setEditFields({ ...editFields, ubicacion: e.target.value })}
                />
              </div>
              <div className={styles.cardCol}>
                <label className={styles.inputLabel}>LinkedIn</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editFields.linkedinUrl || ''}
                  onChange={(e) => setEditFields({ ...editFields, linkedinUrl: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              <div className={styles.cardCol}>
                <span className={styles.cardLabel}>Email</span>
                <span className={styles.cardVal}>
                  <span className={styles.cardValIcon}><MailIcon /></span>
                  {p.correo}
                </span>
              </div>
              <div className={styles.cardCol}>
                <span className={styles.cardLabel}>Teléfono</span>
                <span className={styles.cardVal}>
                  <span className={styles.cardValIcon}><PhoneIcon /></span>
                  {p.telefono || '—'}
                </span>
              </div>
              <div className={styles.cardCol}>
                <span className={styles.cardLabel}>Ubicación</span>
                <span className={styles.cardVal}>
                  <span className={styles.cardValIcon}><MapPinIcon /></span>
                  {p.ubicacion || '—'}
                </span>
              </div>
              <div className={styles.cardCol}>
                <span className={styles.cardLabel}>LinkedIn</span>
                <span className={styles.cardVal}>
                  <span className={styles.cardValIcon}><GlobeIcon /></span>
                  {p.linkedinUrl ? (
                    <a href={`https://${p.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                      {p.linkedinUrl}
                    </a>
                  ) : '—'}
                </span>
              </div>
            </div>
          )}
        </section>

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
                  value={editFields.bio || ''}
                  onChange={(e) => setEditFields({ ...editFields, bio: e.target.value })}
                />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.inputLabel}>Áreas de Expertise</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {editFields.areasExpertise.map((area, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="Nombre del área"
                        value={area.nombre}
                        style={{ flex: 1 }}
                        onChange={(e) => {
                          const updated = [...editFields.areasExpertise];
                          updated[idx] = { ...updated[idx], nombre: e.target.value };
                          setEditFields({ ...editFields, areasExpertise: updated });
                        }}
                      />
                      <input
                        type="number"
                        className={styles.inputField}
                        placeholder="Años"
                        value={area.aniosExperiencia || ''}
                        style={{ width: '100px' }}
                        onChange={(e) => {
                          const updated = [...editFields.areasExpertise];
                          updated[idx] = { ...updated[idx], aniosExperiencia: Number(e.target.value) };
                          setEditFields({ ...editFields, areasExpertise: updated });
                        }}
                      />
                      <span style={{ color: '#64748b', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>años</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editFields.areasExpertise.filter((_, i) => i !== idx);
                          setEditFields({ ...editFields, areasExpertise: updated });
                        }}
                        style={{
                          background: '#fee2e2',
                          border: 'none',
                          borderRadius: '10px',
                          width: '36px',
                          height: '36px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                          fontWeight: 700,
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditFields({
                      ...editFields,
                      areasExpertise: [...editFields.areasExpertise, { nombre: '', aniosExperiencia: 0 }],
                    });
                  }}
                  style={{
                    background: 'none',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#64748b',
                    marginTop: '12px',
                    width: '100%',
                  }}
                >
                  + Agregar Área de Expertise
                </button>
              </div>
            </div>
          ) : (
            <div>
              {p.bio && (
                <>
                  <span className={styles.cardLabel} style={{ display: 'block', marginBottom: '8px' }}>Biografía</span>
                  <p className={styles.cardText}>{p.bio}</p>
                </>
              )}
            </div>
          )}
        </section>

        {p.areasExpertise.length > 0 && (
          <section className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}><BriefcaseIcon /></span>
              <span>Áreas de Expertise</span>
            </div>
            <div className={styles.certList}>
              {p.areasExpertise.map((area, idx) => (
                <div key={idx} className={styles.certRow}>
                  <div className={styles.certBadgeIcon}><BriefcaseIcon /></div>
                  <div className={styles.certInfo}>
                    <span className={styles.certTitle}>{area.nombre}</span>
                    <span className={styles.certIssuer}>{area.aniosExperiencia} {area.aniosExperiencia === 1 ? 'año' : 'años'} de experiencia</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {p.especialidades.length > 0 && (
          <section className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}><TagIcon /></span>
              <span>Especializaciones</span>
            </div>
            <p className={styles.specSubHeader}>Áreas en las que puedes realizar entrevistas</p>
            <div className={styles.specializationList}>
              {p.especialidades.map((spec, idx) => (
                <span key={idx} className={styles.specTag}>{spec}</span>
              ))}
            </div>
          </section>
        )}

        {p.certificaciones.length > 0 && (
          <section className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}><AwardIcon /></span>
              <span>Certificaciones</span>
            </div>
            <div className={styles.certList}>
              {p.certificaciones.map((cert, idx) => (
                <div key={idx} className={styles.certRow}>
                  <div className={styles.certBadgeIcon}><AwardIcon /></div>
                  <div className={styles.certInfo}>
                    <span className={styles.certTitle}>{cert.titulo}</span>
                    <span className={styles.certIssuer}>{cert.emisor}</span>
                    <span className={styles.certYear}>{cert.anio}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {isEditing && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px', marginBottom: '16px' }}>
            <button className={styles.btnCancel} onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
            <button className={styles.btnSave} onClick={handleSaveChanges} disabled={saving}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
