'use client';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import styles from "../styles/LoginRegister.module.css";

const handleGoogleLogin = async () => {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  // 1. Primero abre el popup vacío
  const popup = window.open('', 'Google Login', `width=${width},height=${height},left=${left},top=${top}`);

  // 2. Obtén el CSRF token de next-auth
  const { csrfToken } = await fetch('/api/auth/csrf').then(r => r.json());

  // 3. Haz POST directo al provider — salta la pantalla intermedia
  if (popup) {
    popup.document.write(`
      <form id="f" method="POST" action="/api/auth/signin/google">
        <input type="hidden" name="csrfToken" value="${csrfToken}" />
        <input type="hidden" name="callbackUrl" value="/home" />
      </form>
      <script>document.getElementById('f').submit();</script>
    `);
  }

  // 4. Detecta cuando el popup cierra y redirige
  const interval = setInterval(async () => {
    try {
      if (popup?.closed) {
        clearInterval(interval);
        const session = await fetch('/api/auth/session').then(r => r.json());
        if (session?.user) {
          window.location.href = '/home';
        }
      }
    } catch {
      clearInterval(interval);
    }
  }, 500);
};
const LoginCard = () => {
  return (
    <div className={styles.welcomebox}>
      <div className={styles.cardContent}>
        <Image src="/assets/candado3.png" alt="Candado" width={80} height={80} />
        <div className={styles.textContainer}>
          <h1>Bienvenido a PathFinder</h1>
          <p>Inicia sesión con tu cuenta de Google para continuar y descubrir tu mejor camino.</p>
        </div>
        <button
          className={styles.googleBtn}
          onClick={handleGoogleLogin}
        >
          <Image src="/assets/google.png" alt="Google" className={styles.googleLogo} width={20} height={20} />
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