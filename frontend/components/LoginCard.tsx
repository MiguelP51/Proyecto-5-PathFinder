'use client';

import Image from 'next/image'; // Si usas Next.js para la optimización de imágenes
import { useState } from 'react';
import styles from "../styles/LoginRegister.module.css";

const LoginCard = () => {
    return (
        <div className={styles.welcomebox}>
            <div className={styles.cardContent}>
                <Image
                    src="/assets/candado.png"
                    alt="Candado"
                    width={80}
                    height={80}
                />
                <div>
                    <h1>Bienvenido a PathFinder</h1>
                    <p>Inicia sesión con tu cuenta de Google para continuar y descubrir tu mejor camino.</p>

                </div>
            </div>

            <button className={styles.googleBtn}>
                <Image src="/assets/google-logo.png" alt="Google" className={styles.googleLogo} width={20} height={20} />
                <span>Continuar con Google</span>
            </button>

            <div className={styles.securityText}>
                <p>Seguro y rápido</p>
                <p className={styles.privacyText}>No almacenamos tu información personal sin tu permiso.</p>
            </div>
        </div>
    );
};

export default LoginCard;