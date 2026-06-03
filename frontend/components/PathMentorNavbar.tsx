'use client';

import styles from '../styles/PathMentorNavbar.module.css';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PathMentorNavbar() {

    const pathname = usePathname();
    const router = useRouter();

    const [collapsed, setCollapsed] = useState(false);

    /* LOAD STATE */
    useEffect(() => {

        const savedState = localStorage.getItem('mentor-sidebar');

        if (savedState === 'true') {
            setCollapsed(true);
        }

    }, []);

    /* SAVE STATE */
    useEffect(() => {

        localStorage.setItem(
            'mentor-sidebar',
            String(collapsed)
        );

    }, [collapsed]);

    return (

        <aside
            className={
                collapsed
                    ? styles.sidebarCollapsed
                    : styles.sidebar
            }
        >

            {/* HEADER */}
            <div className={styles.sidebarHeader}>

                <div className={styles.logoContainer}>

                    <div className={styles.logoCircle}>
                        P
                    </div>

                    {!collapsed && (
                        <h1 className={styles.logoText}>
                            PATH<span>MENTOR</span>
                        </h1>
                    )}

                </div>

            </div>

            {/* NAV */}
            <div className={styles.topSection}>

                {!collapsed && (
                    <p className={styles.panelTitle}>
                        PANEL MENTOR
                    </p>
                )}

                <nav className={styles.navLinks}>

                    {/* DASHBOARD */}
                    <button
                        onClick={() => router.push('/dashboard')}
                        className={
                            pathname.includes('dashboard')
                                ? styles.activeLink
                                : styles.link
                        }
                    >
                        <span>📊</span>

                        {!collapsed && (
                            <span>Dashboard</span>
                        )}
                    </button>

                    {/* ENTREVISTAS */}
                    <button
                        onClick={() => router.push('/interviews')}
                        className={
                            pathname.includes('interviews')
                                ? styles.activeLink
                                : styles.link
                        }
                    >
                        <span>📅</span>

                        {!collapsed && (
                            <span>Mis Entrevistas</span>
                        )}
                    </button>

                    {/* DISPONIBILIDAD */}
                    <button
                        onClick={() => router.push('/availability')}
                        className={
                            pathname.includes('availability')
                                ? styles.activeLink
                                : styles.link
                        }
                    >

                        <span>🕒</span>

                        {!collapsed && (
                            <span>Disponibilidad</span>
                        )}

                    </button>

                    {/* FEEDBACK */}
                    <button
                        onClick={() => router.push('/feedbacks')}
                        className={
                            pathname.includes('feedbacks')
                                ? styles.activeLink
                                : styles.link
                        }
                    >
                        <span>💬</span>

                        {!collapsed && (
                            <span>Feedback</span>
                        )}
                    </button>

                    {/* MÉTRICAS */}
                    <button
                        onClick={() => router.push('/metrics')}
                        className={
                            pathname.includes('metrics')
                                ? styles.activeLink
                                : styles.link
                        }
                    >

                        <span>📈</span>

                        {!collapsed && (
                            <span>Mis Métricas</span>
                        )}

                    </button>

                    {/* PERFIL */}
                    <button
                        onClick={() => router.push('/profile')}
                        className={
                            pathname.includes('profile')
                                ? styles.activeLink
                                : styles.link
                        }
                    >

                        <span>👤</span>

                        {!collapsed && (
                            <span>Mi Perfil</span>
                        )}

                    </button>

                    {/* CONFIG */}
                    <button className={styles.link}>

                        <span>⚙️</span>

                        {!collapsed && (
                            <span>Configuración</span>
                        )}

                    </button>

                </nav>

            </div>

            {/* FOOTER */}
            <div className={styles.bottomSection}>

                <button
                    className={styles.collapseButton}
                    onClick={() =>
                        setCollapsed(!collapsed)
                    }
                >

                    {collapsed ? '→' : '← Contraer'}

                </button>

            </div>

        </aside>
    );
}