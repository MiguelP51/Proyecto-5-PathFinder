'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import styles from '../../styles/PathMentorTopbar.module.css';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString('es-PE');
}

const tipoIcon: Record<string, string> = {
  NUEVA_ENTREVISTA: '📅',
  CANCELACION: '❌',
  REAGENDACION: '🔄',
  ENTREVISTA_COMPLETADA: '✅',
};

export default function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notificaciones, noLeidas, loading, marcarLeida, marcarTodasLeidas } =
    useNotifications(session?.backendJwt);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClickNotificacion = async (n: typeof notificaciones[number]) => {
    if (!n.leida) {
      await marcarLeida(n.idNotificacion);
    }
    setIsOpen(false);
    if (n.referenciaId) {
      router.push(`/mentor/interviews?id=${n.referenciaId}`);
    } else {
      router.push('/mentor/interviews');
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <div className={styles.notification} onClick={() => setIsOpen(!isOpen)}>
        <Bell style={{ width: '24px', height: '24px', color: '#64748b' }} />
        {noLeidas > 0 && <span className={styles.badge}>{noLeidas > 99 ? '99+' : noLeidas}</span>}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: '0',
            width: '380px',
            maxHeight: '480px',
            background: 'var(--bg-card, #fff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary, #0f172a)' }}>
              Notificaciones
            </span>
            {noLeidas > 0 && (
              <button
                onClick={marcarTodasLeidas}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#7447D7',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <CheckCheck style={{ width: '14px', height: '14px' }} />
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin" style={{ width: '24px', height: '24px', color: '#7447D7' }} />
              </div>
            ) : notificaciones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '14px' }}>
                No tienes notificaciones
              </div>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.idNotificacion}
                  onClick={() => handleClickNotificacion(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 20px',
                    border: 'none',
                    borderBottom: '1px solid var(--border-color, #e2e8f0)',
                    background: n.leida ? 'transparent' : 'rgba(116, 71, 215, 0.04)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(116, 71, 215, 0.08)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = n.leida ? 'transparent' : 'rgba(116, 71, 215, 0.04)')
                  }
                >
                  <span style={{ fontSize: '20px', lineHeight: '24px', flexShrink: 0 }}>
                    {tipoIcon[n.tipo] || '🔔'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: n.leida ? '400' : '600',
                        color: 'var(--text-primary, #0f172a)',
                        lineHeight: '1.4',
                      }}
                    >
                      {n.mensaje}
                    </p>
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                      {timeAgo(n.fechaCreacion)}
                    </span>
                  </div>
                  {!n.leida && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#7447D7',
                        flexShrink: 0,
                        marginTop: '6px',
                      }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
