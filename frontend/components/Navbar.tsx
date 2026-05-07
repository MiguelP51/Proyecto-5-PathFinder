import Link from "next/link";
import styles from "../styles/Navbar.module.css";

// TO-DO: Agregar estilos al navbar y actualizar los links correspondientes.
export default function Navbar() {
    return (

        <nav className={styles.navbar}>
            {/* Logo en la izquierda */}
            <div className={styles.logo}>
                <Link href="/">
                    <img src="/assets/logo-pf.png" alt="Logo" className={styles.logoImg} />
                </Link>
            </div>

            {/* Menú de navegación */}
            <ul className={styles.navList}>
                <li className={styles.navItem}><Link href="/" data-text="Inicio">Inicio</Link></li>
                <li className={styles.navItem}><Link href="/about" data-text="Sobre nosotros">Sobre nosotros</Link></li>
                <li className={styles.navItem}><Link href="/contact" data-text="Contacto">Contacto</Link></li>
                <li className={styles.navItem}><Link href="/simulation" data-text="Simulación">Simulación</Link></li>
                <li className={styles.navItem}><Link href="/login" data-text="Iniciar sesión">Iniciar sesión</Link></li>
                <li className={styles.actionButton}><Link href="/register" data-text="Empieza ahora">Empieza ahora</Link></li>
            </ul>
        </nav>
    );
}