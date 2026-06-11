'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { apiFetch } from '@/lib/api';

export interface Notificacion {
  idNotificacion: number;
  tipo: string;
  mensaje: string;
  referenciaId: number | null;
  leida: boolean;
  fechaCreacion: string;
}

interface UseNotificationsReturn {
  notificaciones: Notificacion[];
  noLeidas: number;
  loading: boolean;
  marcarLeida: (id: number) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
}

export function useNotifications(token: string | undefined): UseNotificationsReturn {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const stompRef = useRef<Client | null>(null);

  const marcarLeida = useCallback(async (id: number) => {
    if (!token) return;
    try {
      await apiFetch(`/api/notificaciones/${id}/leer`, { method: 'PUT' }, token);
      setNotificaciones((prev) =>
        prev.map((n) => (n.idNotificacion === id ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }, [token]);

  const marcarTodasLeidas = useCallback(async () => {
    if (!token) return;
    try {
      await apiFetch('/api/notificaciones/leer-todas', { method: 'PUT' }, token);
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {
      // silent
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const doFetch = async () => {
      try {
        const [lista, countData] = await Promise.all([
          apiFetch<Notificacion[]>('/api/notificaciones', {}, token),
          apiFetch<{ count: number }>('/api/notificaciones/count', {}, token),
        ]);
        if (cancelled) return;
        setNotificaciones(lista || []);
        setNoLeidas(countData?.count ?? 0);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    doFetch();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const brokerURL = `${protocol}//${window.location.host}/ws`;

    const client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe('/user/queue/notificaciones', (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body);
            if (payload.notificacion) {
              setNotificaciones((prev) => [payload.notificacion, ...prev]);
            }
            if (typeof payload.noLeidas === 'number') {
              setNoLeidas(payload.noLeidas);
            }
          } catch {
            // silent
          }
        });
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      cancelled = true;
      client.deactivate();
    };
  }, [token]);

  return { notificaciones, noLeidas, loading, marcarLeida, marcarTodasLeidas };
}
