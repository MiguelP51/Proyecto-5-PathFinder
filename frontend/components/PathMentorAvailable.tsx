'use client';

import styles from '../styles/Availability.module.css';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

const obtenerSlotsPorBloque = (horaInicio: string, horaFin: string, dur: number, desc: number): number => {
  const [startH, startM] = horaInicio.split(':').map(Number);
  const [endH, endM] = horaFin.split(':').map(Number);
  let startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  let count = 0;

  while (startMin + dur <= endMin) {
    count++;
    startMin += dur + desc;
  }
  return count;
};

const detectarCruceDeBloques = (dia: string, horaInicio: string, horaFin: string, bloquesExistentes: any[]): boolean => {
  const [newStartH, newStartM] = horaInicio.split(':').map(Number);
  const [newEndH, newEndM] = horaFin.split(':').map(Number);
  const newStart = newStartH * 60 + newStartM;
  const newEnd = newEndH * 60 + newEndM;

  return bloquesExistentes.some(b => {
    if (b.day !== dia) return false;
    const [startStr, endStr] = b.time.split(" - ");
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    return newStart < end && start < newEnd;
  });
};

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de configuración de disponibilidad
  const [selectedFilterDay, setSelectedFilterDay] = useState<string>('Lunes');
  const [duracion, setDuracion] = useState<number>(60);
  const [tiempoDescanso, setTiempoDescanso] = useState<number>(15);
  const [maxEntrevistas, setMaxEntrevistas] = useState<number>(4);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Lunes']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedType, setSelectedType] = useState('virtual');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.backendJwt) {
      loadAvailability();
    }
  }, [status, session]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>("/api/disponibilidad/mentor", {}, session?.backendJwt);
      if (data) {
        setDuracion(data.duracionEntrevista || 60);
        setTiempoDescanso(data.tiempoEntreEntrevistas !== undefined ? data.tiempoEntreEntrevistas : 15);
        setMaxEntrevistas(data.maxEntrevistasDia || 4);
         if (data.diasDisponibles && data.diasDisponibles.length > 0) {
           setSelectedFilterDay(data.diasDisponibles[0]);
         } else {
           setSelectedFilterDay('Lunes');
         }
         
         const mapped = (data.bloques || []).map((item: any) => ({
          id: item.idDisponibilidad,
          day: item.diaSemana,
          time: `${item.horaInicio} - ${item.horaFin}`,
          type: item.tipoEntrevista
        }));
        setBlocks(mapped);
      }
    } catch (err) {
      console.error("Error cargando disponibilidad:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!session?.backendJwt) {
      toast.error("Debes iniciar sesión para guardar tu disponibilidad.");
      return;
    }

    if (blocks.length === 0) {
      toast.warning("Debes agregar al menos un bloque de disponibilidad.");
      return;
    }

    // Validar bloques inválidos
    const hasInvalid = blocks.some(b => {
      const [hStart, hEnd] = b.time.split(" - ");
      return obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso) === 0;
    });

    if (hasInvalid) {
      toast.warning("Por favor, corrige o elimina los bloques de disponibilidad marcados como inválidos antes de guardar.");
      return;
    }

    // Validar límite diario excedido (Restricción Estricta)
    const dailySlots: { [key: string]: number } = {};
    blocks.forEach(b => {
      const [hStart, hEnd] = b.time.split(" - ");
      const slots = obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso);
      dailySlots[b.day] = (dailySlots[b.day] || 0) + slots;
    });

    const hasExceeded = Object.keys(dailySlots).some(day => dailySlots[day] > maxEntrevistas);
    if (hasExceeded) {
      toast.warning("Por favor, ajusta tus bloques. El total de entrevistas para uno o más días supera el límite diario permitido.");
      return;
    }

    try {
      // Auto-calcular los días habilitados a partir de los bloques configurados
      const activeDays = Array.from(new Set(blocks.map(b => b.day)));
      
      const dtoList = blocks.map(b => {
        const [hStart, hEnd] = b.time.split(" - ");
        return {
          idDisponibilidad: String(b.id).length > 10 ? null : b.id, // Si es un ID temporal de front, enviamos null
          diaSemana: b.day,
          horaInicio: hStart,
          horaFin: hEnd,
          tipoEntrevista: b.type
        };
      });

      const payload = {
        duracionEntrevista: duracion,
        tiempoEntreEntrevistas: tiempoDescanso,
        maxEntrevistasDia: maxEntrevistas,
        diasDisponibles: activeDays,
        bloques: dtoList
      };

      await apiFetch("/api/disponibilidad/mentor", {
        method: "POST",
        body: JSON.stringify(payload)
      }, session?.backendJwt);

      toast.success("¡Configuración y disponibilidad guardadas con éxito!");
      loadAvailability();
    } catch (err) {
      console.error("Error guardando disponibilidad:", err);
      toast.error("Error al guardar disponibilidad: " + (err instanceof Error ? err.message : err));
    }
  };

    return (

        <>

            {/* CONTENT */}
            <div className={styles.container}>

                {/* HEADER */}
                <div className={styles.header}>

                    <h1>
                        Gestión de Disponibilidad
                    </h1>

                    <p>
                        Configura tus horarios disponibles para entrevistas
                    </p>

                </div>

                {/* CALENDAR SYNC */}
                <div className={styles.syncCard}>

                    <div className={styles.syncIcon}>
                        📅
                    </div>

                    <div className={styles.syncContent}>

                        <h2>
                            Sincronización de Calendario
                        </h2>

                        <p>
                            Conecta tu Google Calendar u Outlook para sincronizar automáticamente tu disponibilidad y evitar conflictos de horarios.
                        </p>

                        <div className={styles.syncButtons}>

                            <button className={styles.calendarButton}>

                                <img
                                    src="/assets/google.png"
                                    alt="Google"
                                />

                                Google Calendar

                            </button>

                            <button className={styles.calendarButton}>

                                <img
                                    src="/assets/outlook.png"
                                    alt="Outlook"
                                />

                                Outlook

                            </button>

                        </div>

                    </div>

                </div>

                {/* MAIN GRID */}
                <div className={styles.mainGrid}>

                    {/* LEFT */}
                    <div className={styles.leftColumn}>

                        <div className={styles.card}>

                            {/* HEADER */}
                            <div className={styles.cardHeader}>

                                <h2>
                                    Configuración Semanal
                                </h2>

                                <p>
                                    Define tus días y horarios disponibles
                                </p>

                            </div>

                            {/* DAYS */}
                            <div className={styles.daysSection}>

                                <h3>
                                    Días disponibles
                                </h3>

                                <div className={styles.daysGrid}>
                                    {DAYS_OF_WEEK.map((day) => (
                                        <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="selectedFilterDay"
                                                checked={selectedFilterDay === day}
                                                onChange={() => setSelectedFilterDay(day)}
                                                className="cursor-pointer"
                                            />
                                            {day}
                                        </label>
                                    ))}
                                </div>

                            </div>

                            {/* BLOCK HEADER */}
                            <div className={styles.blockHeader}>

                                <h3>
                                    Bloques de Tiempo
                                </h3>

                                <button 
                                    className={styles.addButton}
                                    onClick={() => {
                                        setSelectedDays([selectedFilterDay]);
                                        setStartTime('09:00');
                                        setEndTime('10:00');
                                        setSelectedType('virtual');
                                        setIsTypeDropdownOpen(false);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    + Agregar Bloque
                                </button>

                            </div>

                                                 <div className={styles.blocksContainer}>
                            {(() => {
                              // Calcular slots totales por día para las advertencias de límite diario
                              const dailySlotsCount: { [key: string]: number } = {};
                              blocks.forEach(b => {
                                const [hStart, hEnd] = b.time.split(" - ");
                                const slots = obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso);
                                dailySlotsCount[b.day] = (dailySlotsCount[b.day] || 0) + slots;
                              });

                              const filteredBlocks = blocks.filter(b => b.day === selectedFilterDay);

                              return (
                                <>
                                  {filteredBlocks.length === 0 ? (
                                    <div className={styles.emptyBlocksMsg}>
                                      No hay bloques configurados para el {selectedFilterDay}.
                                    </div>
                                  ) : (
                                    filteredBlocks.map((block) => {
                                      const [hStart, hEnd] = block.time.split(" - ");
                                      const slots = obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso);
                                      const isInvalid = slots === 0;

                                      return (
                                        <div
                                          key={block.id}
                                          className={`${styles.timeBlock} ${isInvalid ? styles.invalidBlock : ''}`}
                                        >
                                          <span className={styles.day}>
                                            {block.day}
                                          </span>

                                          <span className={styles.time}>
                                            🕒 {block.time}
                                          </span>
                                          <span className={isInvalid ? styles.invalidBadge : styles.slotsBadge}>
                                            {isInvalid ? '⚠️ Inválido' : `✓ ${slots} entrevista${slots > 1 ? 's' : ''}`}
                                          </span>

                                          <span
                                            className={
                                              block.type === 'virtual'
                                                  ? styles.virtualTag
                                                  : block.type === 'presencial'
                                                      ? styles.presentialTag
                                                      : styles.bothTag
                                            }
                                          >
                                            {block.type}
                                          </span>

                                          <button
                                            className={styles.deleteButton}
                                            onClick={() =>
                                                setBlocks(
                                                    blocks.filter(
                                                        (item) =>
                                                            item.id !== block.id
                                                    )
                                                )
                                            }
                                          >
                                            🗑
                                          </button>
                                        </div>
                                      );
                                    })
                                  )}

                                  {/* Advertencias de límite diario (Restricción Estricta) */}
                                  {dailySlotsCount[selectedFilterDay] > maxEntrevistas && (
                                    <div className={styles.dailyLimitError}>
                                      ❌ {selectedFilterDay}: El total de entrevistas posibles ({dailySlotsCount[selectedFilterDay]}) supera el límite de {maxEntrevistas} por día. Por favor, reduce la duración de los bloques o elimina algunos.
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                            {/* SAVE */}
                            {(() => {
                              const hasInvalidBlocks = blocks.some(b => {
                                  const [hStart, hEnd] = b.time.split(" - ");
                                  return obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso) === 0;
                              });

                              // Calcular slots totales por día para verificar si alguno excede el límite
                              const dailySlots: { [key: string]: number } = {};
                              blocks.forEach(b => {
                                const [hStart, hEnd] = b.time.split(" - ");
                                const slots = obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso);
                                dailySlots[b.day] = (dailySlots[b.day] || 0) + slots;
                              });
                              const hasExceededSlots = Object.keys(dailySlots).some(day => dailySlots[day] > maxEntrevistas);
                              const canSave = !hasInvalidBlocks && !hasExceededSlots;

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
                                  <button 
                                      className={`${styles.saveButton} ${!canSave ? styles.disabledSaveButton : ''}`}
                                      onClick={handleSaveAll}
                                      disabled={!canSave}
                                  >
                                      💾 Guardar Disponibilidad
                                  </button>
                                </>
                              );
                            })()}

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className={styles.rightColumn}>

                        {/* CONFIG */}
                        <div className={styles.sideCard}>

                            <h2>
                                Configuración
                            </h2>

                            <div className={styles.selectGroup}>

                                <label>
                                    Duración por entrevista
                                </label>

                                <select
                                    value={duracion}
                                    onChange={(e) => setDuracion(Number(e.target.value))}
                                >
                                    <option value={30}>30 minutos</option>
                                    <option value={45}>45 minutos</option>
                                    <option value={60}>60 minutos</option>
                                    <option value={90}>90 minutos</option>
                                </select>

                            </div>

                            <div className={styles.selectGroup}>

                                <label>
                                    Tiempo entre entrevistas
                                </label>

                                <select
                                    value={tiempoDescanso}
                                    onChange={(e) => setTiempoDescanso(Number(e.target.value))}
                                >
                                    <option value={0}>0 minutos</option>
                                    <option value={5}>5 minutos</option>
                                    <option value={10}>10 minutos</option>
                                    <option value={15}>15 minutos</option>
                                    <option value={20}>20 minutos</option>
                                    <option value={30}>30 minutos</option>
                                </select>

                            </div>

                            <div className={styles.selectGroup}>

                                <label>
                                    Máximo entrevistas por día
                                </label>

                                <select
                                    value={maxEntrevistas}
                                    onChange={(e) => setMaxEntrevistas(Number(e.target.value))}
                                >
                                    <option value={1}>1 entrevista</option>
                                    <option value={2}>2 entrevistas</option>
                                    <option value={3}>3 entrevistas</option>
                                    <option value={4}>4 entrevistas</option>
                                    <option value={5}>5 entrevistas</option>
                                    <option value={6}>6 entrevistas</option>
                                    <option value={8}>8 entrevistas</option>
                                </select>

                            </div>

                        </div>

                        {/* LINKS */}
                        <div className={styles.linkCard}>

                            <div className={styles.linkIcon}>
                                🔗
                            </div>

                            <div>

                                <h2>
                                    Enlaces Automáticos
                                </h2>

                                <p>
                                    Los enlaces de Google Meet o Teams se generan automáticamente al confirmar una entrevista virtual.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {isModalOpen && (
                <div 
                    className={styles.modalOverlay}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className={styles.modalCloseButton}
                            onClick={() => setIsModalOpen(false)}
                        >
                            &times;
                        </button>
                        
                        <h2 className={styles.modalTitle}>
                            Agregar Bloque de Disponibilidad
                        </h2>
                        <p className={styles.modalDescription}>
                            Define un nuevo bloque de tiempo en el que estarás disponible para entrevistas
                        </p>
                        
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
                                                    if (e.target.checked) {
                                                        setSelectedDays([...selectedDays, d]);
                                                    } else {
                                                        setSelectedDays(selectedDays.filter(day => day !== d));
                                                    }
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
                                    <select 
                                        className={styles.modalSelect}
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    >
                                        {TIME_SLOTS.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label>Hora de fin</label>
                                    <select 
                                        className={styles.modalSelect}
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    >
                                        {TIME_SLOTS.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label>Tipo de entrevista</label>
                                <div className={styles.customSelectContainer}>
                                    <div 
                                        className={`${styles.customSelectTrigger} ${isTypeDropdownOpen ? styles.customSelectTriggerActive : ''}`}
                                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                    >
                                        <span>
                                            {selectedType === 'virtual' ? 'Virtual' : selectedType === 'presencial' ? 'Presencial' : 'Ambos'}
                                        </span>
                                        <span className={`${styles.customSelectArrow} ${isTypeDropdownOpen ? styles.customSelectArrowOpen : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                    
                                    {isTypeDropdownOpen && (
                                        <div className={styles.customDropdownOptions}>
                                            {[
                                                { value: 'virtual', label: 'Virtual' },
                                                { value: 'presencial', label: 'Presencial' },
                                                { value: 'Ambos', label: 'Ambos' }
                                            ].map((opt) => (
                                                <div 
                                                    key={opt.value}
                                                    className={`${styles.customOption} ${selectedType === opt.value ? styles.customOptionSelected : ''}`}
                                                    onClick={() => {
                                                        setSelectedType(opt.value);
                                                        setIsTypeDropdownOpen(false);
                                                    }}
                                                >
                                                    <span>{opt.label}</span>
                                                    {selectedType === opt.value && (
                                                        <svg className={styles.checkmarkIcon} viewBox="0 0 24 24">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {(() => {
                              if (selectedDays.length === 0) {
                                return (
                                  <div className={styles.modalErrorMsg}>
                                    ✗ Debes seleccionar al menos un día.
                                  </div>
                                );
                              }
                              if (startTime >= endTime) return null;
                              const slots = obtenerSlotsPorBloque(startTime, endTime, duracion, tiempoDescanso);
                              if (slots === 0) {
                                return (
                                  <div className={styles.modalErrorMsg}>
                                    ✗ El bloque es demasiado corto para una entrevista de {duracion} min (con {tiempoDescanso} min de descanso).
                                  </div>
                                );
                              }

                              const errors: string[] = [];
                              const successes: string[] = [];

                              selectedDays.forEach(day => {
                                const isOverlapping = detectarCruceDeBloques(day, startTime, endTime, blocks);
                                if (isOverlapping) {
                                  errors.push(`${day}: Este bloque se cruza con uno ya existente.`);
                                  return;
                                }

                                let dailySlots = 0;
                                blocks.forEach(b => {
                                  if (b.day === day) {
                                    const [hStart, hEnd] = b.time.split(" - ");
                                    dailySlots += obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso);
                                  }
                                });
                                const totalSlots = dailySlots + slots;
                                if (totalSlots > maxEntrevistas) {
                                  errors.push(`${day}: Supera el límite diario (${totalSlots} entrevistas, máximo permitido: ${maxEntrevistas}).`);
                                } else {
                                  successes.push(`${day} (${slots} entrevista${slots > 1 ? 's' : ''})`);
                                }
                              });

                              if (errors.length > 0) {
                                return (
                                  <div className="space-y-1 mt-2">
                                    {errors.map((err, idx) => (
                                      <div key={idx} className={styles.modalErrorMsg}>
                                        ✗ {err}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }

                              return (
                                <div className={styles.modalInfoMsg}>
                                  ✓ Bloque válido para: {successes.join(", ")}.
                                </div>
                              );
                            })()}

                            <div className={styles.modalActions}>
                                <button 
                                    className={styles.btnCancel}
                                    onClick={() => setIsModalOpen(false)}
                                  >
                                    Cancelar
                                </button>
                                <button 
                                    className={styles.btnSubmit}
                                    disabled={
                                        selectedDays.length === 0 ||
                                        startTime >= endTime || 
                                        obtenerSlotsPorBloque(startTime, endTime, duracion, tiempoDescanso) === 0 ||
                                        selectedDays.some(day => {
                                          if (detectarCruceDeBloques(day, startTime, endTime, blocks)) return true;
                                          let dailySlots = 0;
                                          blocks.forEach(b => {
                                            if (b.day === day) {
                                              const [hStart, hEnd] = b.time.split(" - ");
                                              dailySlots += obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso);
                                            }
                                          });
                                          const slots = obtenerSlotsPorBloque(startTime, endTime, duracion, tiempoDescanso);
                                          return (dailySlots + slots) > maxEntrevistas;
                                        })
                                    }
                                    onClick={() => {
                                        if (startTime >= endTime) {
                                            toast.error("La hora de inicio debe ser anterior a la hora de fin.");
                                            return;
                                        }

                                        const newBlocksToAdd: any[] = [];
                                        let baseId = Date.now();

                                        for (const day of selectedDays) {
                                            if (detectarCruceDeBloques(day, startTime, endTime, blocks)) {
                                                toast.error(`El bloque se cruza con un bloque existente el día ${day}.`);
                                                return;
                                            }

                                            let dailySlots = 0;
                                            blocks.forEach(b => {
                                                if (b.day === day) {
                                                    const [hStart, hEnd] = b.time.split(" - ");
                                                    dailySlots += obtenerSlotsPorBloque(hStart, hEnd, duracion, tiempoDescanso);
                                                }
                                            });
                                            const newSlots = obtenerSlotsPorBloque(startTime, endTime, duracion, tiempoDescanso);
                                            if (dailySlots + newSlots > maxEntrevistas) {
                                                toast.error(`El bloque supera el máximo permitido de entrevistas el día ${day}.`);
                                                return;
                                            }

                                            newBlocksToAdd.push({
                                                id: baseId++,
                                                day: day,
                                                time: `${startTime} - ${endTime}`,
                                                type: selectedType
                                            });
                                        }

                                        setBlocks([...blocks, ...newBlocksToAdd]);
                                        setIsModalOpen(false);
                                        toast.success("Bloque(s) agregado(s) con éxito.");
                                    }}
                                >
                                    + Agregar Bloque
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>

    );
}
