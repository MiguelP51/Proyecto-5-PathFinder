'use client';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import styles from "../styles/LoginRegister.module.css";

const LoginCard = () => {
  const handleGoogleLogin = async () => {
    signIn('google', {
      callbackUrl: '/role-redirect',
    });
  };

  return (
    <div className={styles.welcomebox}>
      <div className={styles.cardContent}>
        <Image src="/assets/candado3.png" alt="Candado" width={80} height={80} />
        <div className={styles.textContainer}>
          <h1>Bienvenido a PathFinder</h1>
          <p>Inicia sesión con tu cuenta de Google para continuar y descubrir tu mejor camino.</p>
        </div>
        <button
          className="flex flex-row items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7447D7] to-[#D43EE6] hover:opacity-95 text-white font-bold text-sm shadow-md transition cursor-pointer w-[300px]"
          onClick={handleGoogleLogin}
        >
          <Image src="/assets/google.png" alt="Google" className="h-5 w-5 brightness-0 invert" width={20} height={20} />
          <span>Continuar con Google</span>
        </button>
      </div>
      <div className={styles.securityText}>
        <p>Seguro y rápido</p>
        <div className={styles.privacyText}>
          <Image src="/assets/security.png" alt="Google" width={15} height={15} />
          <p>No almacenamos tu información personal sin tu permiso.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
