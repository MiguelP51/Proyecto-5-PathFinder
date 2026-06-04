'use client';

import Image from 'next/image';
import { signIn } from 'next-auth/react';
import styles from '../styles/PathMentorLogin.module.css';
import Navbar from '@/components/Navbar';

const handleGoogleLogin = async () => {
  signIn('google', {
    callbackUrl: '/pathmentor/home',
  });
};

const PathMentorLogin = () => {
  return (
    <>
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTAINER */}
      <div className={styles.container}>

        {/* LOGIN CARD */}
        <div className={styles.card}>

          {/* ICON */}
          <div className={styles.iconBox}>
            <Image
              src="/assets/mentor-icon.png"
              alt="Mentor"
              width={42}
              height={42}
            />
          </div>

          {/* TITLE */}
          <h1 className={styles.title}>
            Portal PathMentor
          </h1>

          {/* SUBTITLE */}
          <p className={styles.subtitle}>
            Accede para gestionar tus entrevistas y evaluaciones
          </p>

          {/* GOOGLE BUTTON */}
          <button
            className={styles.googleButton}
            onClick={handleGoogleLogin}
          >
            <Image
              src="/assets/google.png"
              alt="Google"
              width={20}
              height={20}
            />

            <span>Continuar con Google</span>
          </button>

          {/* DIVIDER */}
          <div className={styles.divider}>
            <span>Acceso para mentores</span>
          </div>

          {/* FOOTER */}
          <div className={styles.footer}>

            <Image
              src="/assets/security.png"
              alt="Security"
              width={16}
              height={16}
            />

            <p>
              Acceso exclusivo para PathMentors autorizados
            </p>

          </div>

        </div>

        {/* BACK BUTTON */}
        <button className={styles.backButton}>
          ← Volver a selección de rol
        </button>

      </div>
    </>
  );
};

export default PathMentorLogin;