'use client';

import styles from '../styles/Availability.module.css';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de configuración de disponibilidad
  const [checkedDays, setCheckedDays] = useState<string[]>(['Lunes', 'Miércoles', 'Viernes']);
  const [duracion, setDuracion] = useState<number>(60);
  const [tiempoDescanso, setTiempoDescanso] = useState<number>(15);
  const [maxEntrevistas, setMaxEntrevistas] = useState<number>(4);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Lunes');
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
        setCheckedDays(data.diasDisponibles || ['Lunes', 'Miércoles', 'Viernes']);
        
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
      alert("Debes iniciar sesión para guardar tu disponibilidad.");
      return;
    }

    if (checkedDays.length === 0) {
      alert("Debes seleccionar al menos un día disponible.");
      return;
    }

    try {
      // Filtrar los bloques antes de guardar para eliminar de inmediato los bloques de días desmarcados
      const filteredBlocks = blocks.filter(b => checkedDays.includes(b.day));
      
      const dtoList = filteredBlocks.map(b => {
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
        diasDisponibles: checkedDays,
        bloques: dtoList
      };

      await apiFetch("/api/disponibilidad/mentor", {
        method: "POST",
        body: JSON.stringify(payload)
      }, session?.backendJwt);

      alert("¡Configuración y disponibilidad guardadas con éxito!");
      loadAvailability();
    } catch (err) {
      console.error("Error guardando disponibilidad:", err);
      alert("Error al guardar disponibilidad: " + (err instanceof Error ? err.message : err));
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
                                        <label key={day}>
                                            <input
                                                type="checkbox"
                                                checked={checkedDays.includes(day)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setCheckedDays([...checkedDays, day]);
                                                    } else {
                                                        setCheckedDays(checkedDays.filter(d => d !== day));
                                                    }
                                                }}
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
                                        setSelectedDay('Lunes');
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

                            {/* BLOCKS */}
                          <div className={styles.blocksContainer}>

                            {blocks.map((block) => (

                                <div
                                    key={block.id}
                                    className={styles.timeBlock}
                                >

            <span className={styles.day}>
                {block.day}
            </span>

                                  <span className={styles.time}>
                🕒 {block.time}
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

                            ))}

                          </div>

                            {/* SAVE */}
                            <button 
                                className={styles.saveButton}
                                onClick={handleSaveAll}
                            >
                                💾 Guardar Disponibilidad
                            </button>

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
                                <label>Día</label>
                                <select 
                                    className={styles.modalSelect}
                                    value={selectedDay}
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                >
                                    {DAYS_OF_WEEK.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
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
                            
                            <div className={styles.modalActions}>
                                <button 
                                    className={styles.btnCancel}
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className={styles.btnSubmit}
                                    onClick={() => {
                                        // Simple validation
                                        if (startTime >= endTime) {
                                            alert("La hora de inicio debe ser anterior a la hora de fin.");
                                            return;
                                        }

                                        // Validar que el día del bloque esté seleccionado como disponible
                                        if (!checkedDays.includes(selectedDay)) {
                                            alert(`El día ${selectedDay} no está marcado como disponible. Actívalo en la sección "Días disponibles" antes de agregar bloques para este día.`);
                                            return;
                                        }
                                        
                                        const newBlock = {
                                            id: Date.now(),
                                            day: selectedDay,
                                            time: `${startTime} - ${endTime}`,
                                            type: selectedType
                                        };
                                        
                                        setBlocks([...blocks, newBlock]);
                                        setIsModalOpen(false);
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
