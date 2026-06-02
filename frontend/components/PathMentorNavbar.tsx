'use client';

import styles from '../styles/PathMentorNavbar.module.css';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PathMentorNavbar() {

    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    return (
        <header className={styles.navbar}>

            {/* LEFT */}
            <div className={styles.leftSection}>

                <div className={styles.logoContainer}>
                    <div className={styles.logoCircle}>P</div>

                    <h1 className={styles.logoText}>
                        PATH<span>MENTOR</span>
                    </h1>
                </div>

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
                        Dashboard
                    </button>

                    {/* ENTREVISTAS */}
                    <button
                        className={
                            pathname.includes('entrevistas')
                                ? styles.activeLink
                                : styles.link
                        }
                    >
                         Mis Entrevistas
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
                         Disponibilidad
                    </button>

                    {/* METRICAS */}
                    <button
                        className={
                            pathname.includes('metricas')
                                ? styles.activeLink
                                : styles.link
                        }
                    >
                         Mis Métricas
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
                         Mi Perfil
                    </button>

                </nav>
            </div>

            {/* RIGHT */}
            <div className={styles.rightSection}>

                <div className={styles.notification}>
                    🔔
                    <span className={styles.badge}>3</span>
                </div>

                <div className={styles.userSection}>

                    <div className={styles.avatar}>
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="avatar" className="h-full w-full rounded-full object-cover" />
                        ) : (
                            "👨🏽‍💼"
                        )}
                    </div>

                    <div>
                        <h3>{session?.user?.name || "PathMentor"}</h3>
                        <p>Mentor</p>
                    </div>

                </div>

            </div>

        </header>
    );
}