'use client';

import styles from '../styles/Availability.module.css';

import PathMentorNavbar from '@/components/PathMentorNavbar';
import PathMentorTopbar from '@/components/PathMentorTopbar';
import { useState } from 'react';



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

                                <button className={styles.addButton}>
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

        </>

    );
}
