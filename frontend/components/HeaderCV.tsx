import Link from "next/link";
import styles from "../styles/HeaderCV.module.css";

// TO-DO: Agregar estilos al navbar y actualizar los links correspondientes.
export default function HeaderCV() {
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
                <li className={styles.navItem}><Link href="/login" data-text="Iniciar sesión">Omitir</Link></li>
                <li className={styles.actionButton}><Link href="/register" data-text="Empieza ahora">Guardar y continuar</Link></li>
            </ul>
        </nav>
    );
}