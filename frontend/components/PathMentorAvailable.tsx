'use client';

import styles from '../styles/Availability.module.css';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];
const START_HOUR = 7;
const HOUR_HEIGHT = 60;
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const timeToY = (time: string): number => {
  return ((timeToMinutes(time) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
};

const obtenerSlotsPorBloque = (horaInicio: string, horaFin: string, dur: number, desc: number): number => {
  const startMin = timeToMinutes(horaInicio);
  const endMin = timeToMinutes(horaFin);
  let cursor = startMin;
  let count = 0;
  while (cursor + dur <= endMin) {
    count++;
    cursor += dur + desc;
  }
  return count;
};

const detectarCruceDeBloques = (dia: string, horaInicio: string, horaFin: string, bloquesExistentes: Block[]): boolean => {
  const newStart = timeToMinutes(horaInicio);
  const newEnd = timeToMinutes(horaFin);
  return bloquesExistentes.some(b => {
    if (b.day !== dia) return false;
    const [s, e] = b.time.split(' - ');
    const start = timeToMinutes(s);
    const end = timeToMinutes(e);
    return newStart < end && start < newEnd;
  });
};

const formatMinutes = (mins: number): string =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

const generateSlotsFromRange = (startTime: string, endTime: string, dur: number, desc: number): string[] => {
  const slots: string[] = [];
  let cursor = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  while (cursor + dur <= end) {
    slots.push(`${formatMinutes(cursor)} - ${formatMinutes(cursor + dur)}`);
    cursor += dur + desc;
  }
  return slots;
};

const splitRangeBlocks = (blocks: Block[], dur: number, desc: number): Block[] => {
  const result: Block[] = [];
  let nextId = Date.now();
  blocks.forEach(b => {
    const [hStart, hEnd] = b.time.split(' - ');
    const slots = generateSlotsFromRange(hStart, hEnd, dur, desc);
    if (slots.length > 1) {
      slots.forEach(s => {
        result.push({ id: nextId++, day: b.day, time: s, type: b.type });
      });
    } else {
      result.push(b);
    }
  });
  return result;
};

const getWeekDates = (offset: number) => {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return DAYS_OF_WEEK.map((dayName, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { dayName, date: d };
  });
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const formatWeekRange = (dates: { dayName: string; date: Date }[]): string => {
  const s = dates[0].date;
  const e = dates[6].date;
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return `Semana del ${s.getDate()} al ${e.getDate()} de ${MONTHS[s.getMonth()]}, ${s.getFullYear()}`;
  if (s.getFullYear() === e.getFullYear())
    return `Semana del ${s.getDate()} de ${MONTHS[s.getMonth()]} al ${e.getDate()} de ${MONTHS[e.getMonth()]}, ${s.getFullYear()}`;
  return `Semana del ${s.getDate()} de ${MONTHS[s.getMonth()]} ${s.getFullYear()} al ${e.getDate()} de ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
};

interface Block {
  id: number;
  day: string;
  time: string;
  type: string;
}

interface BloqueDTO {
  idDisponibilidad: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  tipoEntrevista: string;
}

interface AvailabilityResponse {
  duracionEntrevista: number;
  tiempoEntreEntrevistas: number;
  maxEntrevistasDia: number;
  diasDisponibles: string[];
  bloques: BloqueDTO[];
}

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  const [duracion, setDuracion] = useState<number>(60);
  const [tiempoDescanso, setTiempoDescanso] = useState<number>(15);
  const [maxEntrevistas, setMaxEntrevistas] = useState<number>(4);

  const [weekOffset, setWeekOffset] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Lunes']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedType, setSelectedType] = useState('virtual');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<AvailabilityResponse>('/api/disponibilidad/mentor', {}, session?.backendJwt);
      if (data) {
        const dur = data.duracionEntrevista || 60;
        const desc = data.tiempoEntreEntrevistas !== undefined ? data.tiempoEntreEntrevistas : 15;
        setDuracion(dur);
        setTiempoDescanso(desc);
        setMaxEntrevistas(data.maxEntrevistasDia || 4);
        const mapped = (data.bloques || []).map((item) => ({
          id: item.idDisponibilidad,
          day: item.diaSemana,
          time: `${item.horaInicio} - ${item.horaFin}`,
          type: item.tipoEntrevista
        }));
        setBlocks(splitRangeBlocks(mapped, dur, desc));
      }
    } catch (err) {
      console.error('Error cargando disponibilidad:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.backendJwt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const handleSaveAll = async () => {
    if (!session?.backendJwt) {
      toast.error('Debes iniciar sesión para guardar tu disponibilidad.');
      return;
    }
    if (blocks.length === 0) {
      toast.warning('Debes agregar al menos un bloque de disponibilidad.');
      return;
    }
    const hasInvalid = blocks.some(b => {
      const [hStart, hEnd] = b.time.split(' - ');
      return obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso) === 0;
    });
    if (hasInvalid) {
      toast.warning('Por favor, corrige o elimina los bloques de disponibilidad marcados como inválidos antes de guardar.');
      return;
    }
    const dailySlots: { [key: string]: number } = {};
    blocks.forEach(b => {
      const [hStart, hEnd] = b.time.split(' - ');
      const slots = obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso);
      dailySlots[b.day] = (dailySlots[b.day] || 0) + slots;
    });
    const hasExceeded = Object.keys(dailySlots).some(day => dailySlots[day] > maxEntrevistas);
    if (hasExceeded) {
      toast.warning('Por favor, ajusta tus bloques. El total de entrevistas para uno o más días supera el límite diario permitido.');
      return;
    }
    try {
      const activeDays = Array.from(new Set(blocks.map(b => b.day)));
      const dtoList = blocks.map(b => {
        const [hStart, hEnd] = b.time.split(' - ');
        return {
          idDisponibilidad: String(b.id).length > 10 ? null : b.id,
          diaSemana: b.day,
          horaInicio: hStart,
          horaFin: hEnd,
          tipoEntrevista: b.type
        };
      });
      await apiFetch('/api/disponibilidad/mentor', {
        method: 'POST',
        body: JSON.stringify({
          duracionEntrevista: duracion,
          tiempoEntreEntrevistas: tiempoDescanso,
          maxEntrevistasDia: maxEntrevistas,
          diasDisponibles: activeDays,
          bloques: dtoList
        })
      }, session?.backendJwt);
      toast.success('¡Configuración y disponibilidad guardadas con éxito!');
      loadAvailability();
    } catch (err) {
      console.error('Error guardando disponibilidad:', err);
      toast.error('Error al guardar disponibilidad: ' + (err instanceof Error ? err.message : err));
    }
  };

  const invalidBlocks = blocks.filter(b => {
    const [hStart, hEnd] = b.time.split(' - ');
    return obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso) === 0;
  });
  const invalidBlockIds = new Set(invalidBlocks.map(b => b.id));

  const dailySlots: { [key: string]: number } = {};
  blocks.forEach(b => {
    const [hStart, hEnd] = b.time.split(' - ');
    const slots = obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso);
    dailySlots[b.day] = (dailySlots[b.day] || 0) + slots;
  });
  const hasExceededSlots = Object.keys(dailySlots).some(day => dailySlots[day] > maxEntrevistas);

  const handleCellClick = (dayName: string, time: string) => {
    const idx = TIME_SLOTS.indexOf(time);
    const next = idx < TIME_SLOTS.length - 1 ? TIME_SLOTS[idx + 1] : time;
    setSelectedDays([dayName]);
    setStartTime(time);
    setEndTime(next);
    setSelectedType('virtual');
    setIsTypeDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleDeleteBlock = (id: number) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    toast.success('Bloque eliminado');
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Gestión de Disponibilidad</h1>
          <p>Configura tus horarios disponibles para entrevistas</p>
        </div>

        {/* Mobile sidebar trigger — visible on tablet/mobile */}
        <button className={styles.sidebarTrigger} onClick={() => setSidebarOpen(true)}>
          Configuración
        </button>

        <div className={styles.mainGrid}>
          {/* SIDEBAR — desktop config panel + sync + save */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarContent}>
              {/* Config Panel */}
              <section className={styles.configPanel}>
                <h3>Configuración</h3>
                <div className={styles.sidebarSelects}>
                  <div className={styles.selectGroup}>
                    <label>Duración de cada entrevista</label>
                    <select value={duracion} onChange={(e) => setDuracion(Number(e.target.value))}>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>
                  <div className={styles.selectGroup}>
                    <label>Descanso entre entrevistas</label>
                    <select value={tiempoDescanso} onChange={(e) => setTiempoDescanso(Number(e.target.value))}>
                      <option value={0}>0 min</option>
                      <option value={5}>5 min</option>
                      <option value={10}>10 min</option>
                      <option value={15}>15 min</option>
                      <option value={20}>20 min</option>
                      <option value={30}>30 min</option>
                    </select>
                  </div>
                  <div className={styles.selectGroup}>
                    <label>Límite diario de entrevistas</label>
                    <select value={maxEntrevistas} onChange={(e) => setMaxEntrevistas(Number(e.target.value))}>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                    </select>
                  </div>
                  <button className={styles.addButton} onClick={() => {
                    setSelectedDays(['Lunes']);
                    setStartTime('09:00');
                    setEndTime('10:00');
                    setSelectedType('virtual');
                    setIsTypeDropdownOpen(false);
                    setIsModalOpen(true);
                  }}>
                    + Añadir horario
                  </button>
                </div>
              </section>

              {/* Sync Card — compact */}
              <section className={styles.sidebarSyncCard}>
                <h3>📅 Sincronización de Calendario</h3>
                <p>Conecta tu Google Calendar para evitar conflictos de horarios. Próximamente disponible.</p>
                <button className={styles.calendarButton} disabled title="Funcionalidad no disponible aún">
                  <img src="/assets/google.png" alt="Google Calendar" />
                  Google Calendar
                  <span className={styles.comingSoonBadge}>Próximamente</span>
                </button>
              </section>

              {/* Save Button */}
              {(() => {
                const hasInvalidBlocks = invalidBlocks.length > 0;
                const canSave = !hasInvalidBlocks && !hasExceededSlots;
                return (
                  <button
                    className={`${styles.sidebarSaveButton} ${!canSave ? styles.disabledSaveButton : ''}`}
                    onClick={handleSaveAll}
                    disabled={!canSave}
                  >
                    💾 Guardar Configuración
                  </button>
                );
              })()}
            </div>
          </aside>

          {/* MAIN CONTENT — calendar grid + legend + validation */}
          <main className={styles.mainContent}>
            <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Configuración Semanal</h2>
            <p>Visualiza y administra tus horarios en la semana</p>
          </div>

          {/* Week Navigation */}
          <div className={styles.weekNav}>
            <button className={styles.weekNavBtn} onClick={() => setWeekOffset(weekOffset - 1)} aria-label="Semana anterior">←</button>
            <span className={styles.weekNavTitle}>{formatWeekRange(weekDates)}</span>
            <button className={styles.weekNavBtn} onClick={() => setWeekOffset(weekOffset + 1)} aria-label="Semana siguiente">→</button>
            <button className={styles.weekNavToday} onClick={() => setWeekOffset(0)}>Hoy</button>
          </div>


          {loading ? (
            <div className={styles.loadingState}>Cargando disponibilidad…</div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className={styles.calWrap}>
                <div className={styles.calHeader}>
                  <div className={styles.calTimeGutter}></div>
                  {weekDates.map(({ dayName, date }) => (
                    <div key={dayName} className={`${styles.calDayHeader} ${isSameDay(date, new Date()) ? styles.calDayToday : ''}`}>
                      <span className={styles.calDayName}>{dayName.slice(0, 3)}</span>
                      <span className={styles.calDayNum}>{date.getDate()}</span>
                      <span className={`${styles.calDayCounter} ${(dailySlots[dayName] || 0) > maxEntrevistas ? styles.calDayOver : (dailySlots[dayName] || 0) >= maxEntrevistas * 0.75 ? styles.calDayWarn : ''}`}>
                        {(dailySlots[dayName] || 0)}/{maxEntrevistas}
                      </span>
                    </div>
                  ))}
                </div>
                <div className={styles.calBody}>
                  <div className={styles.calTimeCol}>
                    {TIME_SLOTS.map(t => (
                      <div key={t} className={styles.calTimeSlot}>{t}</div>
                    ))}
                  </div>
                  {weekDates.map(({ dayName, date }) => (
                    <div key={dayName} className={`${styles.calDayCol} ${isSameDay(date, new Date()) ? styles.calColToday : ''}`}>
                      <div className={styles.calHourLines}>
                        {TIME_SLOTS.map(t => (
                          <div key={t} className={styles.calHourLine} onClick={() => handleCellClick(dayName, t)} />
                        ))}
                      </div>
                      {blocks.filter(b => b.day === dayName).map(block => {
                        const [hs, he] = block.time.split(' - ');
                        const top = timeToY(hs);
                        const h = timeToY(he) - top;
                        const tClass = block.type === 'virtual' ? styles.blockVirtual : block.type === 'presencial' ? styles.blockPresencial : styles.blockAmbos;
                        const blockSlots = obtenerSlotsPorBloque(hs, he, duracion, tiempoDescanso);
                        return (
                          <div key={block.id} className={`${styles.calBlock} ${tClass} ${invalidBlockIds.has(block.id) ? styles.blockInvalid : ''}`} style={{ top, height: Math.max(h, 20) }}>
                            <div className={styles.calBlockTime}>{block.time}</div>
                            <div className={styles.calBlockLabel}>{block.type === 'virtual' ? 'Virtual' : block.type === 'presencial' ? 'Presencial' : 'Ambos'}</div>
                            <span className={styles.calBlockBadge}>{blockSlots} entrevista{blockSlots > 1 ? 's' : ''}</span>
                            <button className={styles.calBlockDel} onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }} title="Eliminar bloque">×</button>
                          </div>
                        );
                      })}

                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className={styles.calLegend}>
                <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.blockVirtual}`}></span> Virtual</span>
                <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.blockPresencial}`}></span> Presencial</span>
                <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.blockAmbos}`}></span> Ambos</span>
                <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#e2e8f0' }}></span> Haz clic en una celda para añadir</span>
              </div>
            </>
          )}

          {/* Validation errors */}
          {(() => {
            const hasInvalidBlocks = invalidBlocks.length > 0;
            return (
              <>
                {hasInvalidBlocks && (
                  <div className={styles.globalErrorBanner}>
                    ⚠️ Hay bloques en conflicto con la configuración actual (duración de {duracion} min + {tiempoDescanso} min de descanso). Por favor, corrígelos o elimínalos para poder guardar.
                  </div>
                )}
                {hasExceededSlots && (
                  <div className={styles.globalErrorBanner}>
                    ⚠️ El total de entrevistas en uno o más días supera el límite diario permitido ({maxEntrevistas}). Ajusta tus bloques para poder guardar.
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </main>
    </div>
  </div>

  {/* MOBILE DRAWER OVERLAY */}
  {sidebarOpen && (
    <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}>
      <aside className={styles.sidebarDrawer} onClick={(e) => e.stopPropagation()}>
        <button className={styles.drawerClose} onClick={() => setSidebarOpen(false)}>×</button>
        <div className={styles.sidebarContent}>
          <section className={styles.configPanel}>
            <h3>Configuración</h3>
            <div className={styles.sidebarSelects}>
              <div className={styles.selectGroup}>
                <label>Duración de cada entrevista</label>
                <select value={duracion} onChange={(e) => setDuracion(Number(e.target.value))}>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>
              <div className={styles.selectGroup}>
                <label>Descanso entre entrevistas</label>
                <select value={tiempoDescanso} onChange={(e) => setTiempoDescanso(Number(e.target.value))}>
                  <option value={0}>0 min</option>
                  <option value={5}>5 min</option>
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                  <option value={30}>30 min</option>
                </select>
              </div>
              <div className={styles.selectGroup}>
                <label>Límite diario de entrevistas</label>
                <select value={maxEntrevistas} onChange={(e) => setMaxEntrevistas(Number(e.target.value))}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                </select>
              </div>
              <button className={styles.addButton} onClick={() => {
                setSelectedDays(['Lunes']);
                setStartTime('09:00');
                setEndTime('10:00');
                setSelectedType('virtual');
                setIsTypeDropdownOpen(false);
                setIsModalOpen(true);
              }}>
                + Añadir horario
              </button>
            </div>
          </section>
          <section className={styles.sidebarSyncCard}>
            <h3>📅 Sincronización de Calendario</h3>
            <p>Conecta tu Google Calendar para evitar conflictos de horarios. Próximamente disponible.</p>
            <button className={styles.calendarButton} disabled title="Funcionalidad no disponible aún">
              <img src="/assets/google.png" alt="Google Calendar" />
              Google Calendar
              <span className={styles.comingSoonBadge}>Próximamente</span>
            </button>
          </section>
          {(() => {
            const hasInvalidBlocks = invalidBlocks.length > 0;
            const canSave = !hasInvalidBlocks && !hasExceededSlots;
            return (
              <button
                className={`${styles.sidebarSaveButton} ${!canSave ? styles.disabledSaveButton : ''}`}
                onClick={handleSaveAll}
                disabled={!canSave}
              >
                💾 Guardar Configuración
              </button>
            );
          })()}
        </div>
      </aside>
    </div>
  )}

      {/* MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={() => setIsModalOpen(false)}>&times;</button>
            <h2 className={styles.modalTitle}>Agregar Bloque de Disponibilidad</h2>
            <p className={styles.modalDescription}>Define un nuevo bloque de tiempo en el que estarás disponible para entrevistas</p>
            <div className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-200">Días aplicables</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {DAYS_OF_WEEK.map((d) => (
                    <label key={d} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(d)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDays([...selectedDays, d]);
                          else setSelectedDays(selectedDays.filter(day => day !== d));
                        }}
                        className="cursor-pointer rounded border-slate-300 text-[#7447D7] focus:ring-[#7447D7]"
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Hora de inicio</label>
                  <select className={styles.modalSelect} value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Hora de fin</label>
                  <select className={styles.modalSelect} value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Tipo de entrevista</label>
                <div className={styles.customSelectContainer}>
                  <div className={`${styles.customSelectTrigger} ${isTypeDropdownOpen ? styles.customSelectTriggerActive : ''}`} onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}>
                    <span>{selectedType === 'virtual' ? 'Virtual' : selectedType === 'presencial' ? 'Presencial' : 'Ambos'}</span>
                    <span className={`${styles.customSelectArrow} ${isTypeDropdownOpen ? styles.customSelectArrowOpen : ''}`}>▼</span>
                  </div>
                  {isTypeDropdownOpen && (
                    <div className={styles.customDropdownOptions}>
                      {[
                        { value: 'virtual', label: 'Virtual' },
                        { value: 'presencial', label: 'Presencial' },
                        { value: 'Ambos', label: 'Ambos' }
                      ].map(opt => (
                        <div key={opt.value} className={`${styles.customOption} ${selectedType === opt.value ? styles.customOptionSelected : ''}`} onClick={() => { setSelectedType(opt.value); setIsTypeDropdownOpen(false); }}>
                          <span>{opt.label}</span>
                          {selectedType === opt.value && (
                            <svg className={styles.checkmarkIcon} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {(() => {
                if (selectedDays.length === 0) return <div className={styles.modalErrorMsg}>✗ Debes seleccionar al menos un día.</div>;
                if (startTime >= endTime) return null;
                const slotTimes = generateSlotsFromRange(startTime, endTime, duracion, tiempoDescanso);
                if (slotTimes.length === 0) return <div className={styles.modalErrorMsg}>✗ El bloque es demasiado corto para una entrevista de {duracion} min (con {tiempoDescanso} min de descanso).</div>;
                const errors: string[] = [];
                const successes: string[] = [];
                selectedDays.forEach(day => {
                  if (slotTimes.some(slot => {
                    const [s, e] = slot.split(' - ');
                    return detectarCruceDeBloques(day, s, e, blocks);
                  })) {
                    errors.push(`${day}: Uno o más slots se cruzan con bloques existentes.`);
                    return;
                  }
                  let dailySlotsCount = 0;
                  blocks.forEach(b => {
                    if (b.day === day) {
                      dailySlotsCount += 1;
                    }
                  });
                  const totalSlots = dailySlotsCount + slotTimes.length;
                  if (totalSlots > maxEntrevistas) {
                    errors.push(`${day}: Supera el límite diario (${totalSlots} entrevistas, máximo permitido: ${maxEntrevistas}).`);
                  } else {
                    successes.push(`${day}: ${slotTimes.join(', ')} (${slotTimes.length} entrevista${slotTimes.length > 1 ? 's' : ''})`);
                  }
                });
                if (errors.length > 0) {
                  return <div className="space-y-1 mt-2">{errors.map((err, idx) => <div key={idx} className={styles.modalErrorMsg}>✗ {err}</div>)}</div>;
                }
                return <div className={styles.modalInfoMsg}>✓ Bloques a generar: {successes.join(' | ')}.</div>;
              })()}
              <div className={styles.modalActions}>
                <button className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button
                  className={styles.btnSubmit}
                  disabled={
                    selectedDays.length === 0 || startTime >= endTime ||
                    (() => {
                      const slotTimes = generateSlotsFromRange(startTime, endTime, duracion, tiempoDescanso);
                      if (slotTimes.length === 0) return true;
                      return selectedDays.some(day => {
                        if (slotTimes.some(slot => {
                          const [s, e] = slot.split(' - ');
                          return detectarCruceDeBloques(day, s, e, blocks);
                        })) return true;
                        let dailySlotsCount = 0;
                        blocks.forEach(b => {
                          if (b.day === day) dailySlotsCount += 1;
                        });
                        return (dailySlotsCount + slotTimes.length) > maxEntrevistas;
                      });
                    })()
                  }
                  onClick={() => {
                    if (startTime >= endTime) { toast.error('La hora de inicio debe ser anterior a la hora de fin.'); return; }
                    const slotTimes = generateSlotsFromRange(startTime, endTime, duracion, tiempoDescanso);
                    if (slotTimes.length === 0) { toast.error('El bloque es demasiado corto para una entrevista.'); return; }
                    const newBlocks: Block[] = [];
                    let baseId = Date.now();
                    for (const day of selectedDays) {
                      if (slotTimes.some(slot => {
                        const [s, e] = slot.split(' - ');
                        return detectarCruceDeBloques(day, s, e, blocks);
                      })) { toast.error(`Uno o más slots se cruzan con bloques existentes el día ${day}.`); return; }
                      let dailySlotsCount = 0;
                      blocks.forEach(b => {
                        if (b.day === day) dailySlotsCount += 1;
                      });
                      if (dailySlotsCount + slotTimes.length > maxEntrevistas) { toast.error(`Supera el límite diario de ${maxEntrevistas} entrevistas el día ${day}.`); return; }
                      slotTimes.forEach(slot => {
                        newBlocks.push({ id: baseId++, day, time: slot, type: selectedType });
                      });
                    }
                    setBlocks([...blocks, ...newBlocks]);
                    setIsModalOpen(false);
                    toast.success(`Bloque(s) agregado(s) con éxito (${slotTimes.length} entrevista${slotTimes.length > 1 ? 's' : ''} por día).`);
                  }}
                >
                  + Añadir horario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
