'use client';

import styles from '../styles/Availability.module.css';

import PathMentorNavbar from '@/components/PathMentorNavbar';
import PathMentorTopbar from '@/components/PathMentorTopbar';
import { useState } from 'react';



const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export default function AvailabilityPage() {

  const [blocks, setBlocks] = useState([
    {
      id: 1,
      day: 'Lunes',
      time: '09:00 - 12:00',
      type: 'virtual'
    },
    {
      id: 2,
      day: 'Martes',
      time: '14:00 - 17:00',
      type: 'Ambos'
    },
    {
      id: 3,
      day: 'Miércoles',
      time: '10:00 - 13:00',
      type: 'virtual'
    },
    {
      id: 4,
      day: 'Viernes',
      time: '15:00 - 18:00',
      type: 'presencial'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Lunes');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedType, setSelectedType] = useState('virtual');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    return (

        <>

            {/* SIDEBAR */}
            <PathMentorNavbar />

            {/* TOPBAR */}
            <PathMentorTopbar />

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

                                    <label>
                                        <input
                                            type="checkbox"
                                            defaultChecked

                                        />

                                        Lunes
                                    </label>

                                    <label>
                                        <input type="checkbox" />
                                        Martes
                                    </label>

                                    <label>
                                        <input
                                            type="checkbox"
                                            defaultChecked

                                        />

                                        Miércoles
                                    </label>

                                    <label>
                                        <input type="checkbox" />
                                        Jueves
                                    </label>

                                    <label>
                                        <input
                                            type="checkbox"
                                            defaultChecked

                                        />

                                        Viernes
                                    </label>

                                    <label>
                                        <input type="checkbox" />
                                        Sábado
                                    </label>

                                    <label>
                                        <input type="checkbox" />
                                        Domingo
                                    </label>

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
                            <button className={styles.saveButton}>
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

                                <select>
                                    <option>
                                        60 minutos
                                    </option>
                                </select>

                            </div>

                            <div className={styles.selectGroup}>

                                <label>
                                    Tiempo entre entrevistas
                                </label>

                                <select>
                                    <option>
                                        15 minutos
                                    </option>
                                </select>

                            </div>

                            <div className={styles.selectGroup}>

                                <label>
                                    Máximo entrevistas por día
                                </label>

                                <select>
                                    <option>
                                        4 entrevistas
                                    </option>
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
