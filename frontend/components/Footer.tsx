import styles from "../styles/Footer.module.css";
import { Target, Mail, Phone, MapPin } from "lucide-react";

type IconProps = {
  name: string;
};

function Icon({ name }: IconProps) {
  if (name === 'target') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

type FooterColumnProps = {
  title: string;
  links: string[];
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <section className={styles.footerColumn}>
      <h3>{title}</h3>
      <ul>
        {links.map((link) => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <section className={styles.footerBrand} aria-label="PathFinder">
          <div className={styles.footerLogoRow}>
            <span className={styles.footerLogoMark}>
              <Target size={34} strokeWidth={2.3} />
            </span>

            <div className={styles.footerLogoText}>
              <strong>PathFinder</strong>
              <span>Tu camino al éxito</span>
            </div>
          </div>

          <p>
            Transformamos la manera en que las personas viven los procesos de selección,
            brindando experiencias auténticas y preparando el talento del futuro.
          </p>

          <ul className={styles.contactList}>
            <li>
              <span>✉</span> contacto@pathfinder.com
            </li>
            <li>
              <span>☏</span> +51 999 999 999
            </li>
            <li>
              <span>⌖</span> Lima, Perú
            </li>
          </ul>

          <div className={styles.socials} aria-label="Redes sociales">
            <a href="#" aria-label="Facebook">
              f
            </a>
            <a href="#" aria-label="Twitter">
              t
            </a>
            <a href="#" aria-label="LinkedIn">
              in
            </a>
            <a href="#" aria-label="Instagram">
              ◎
            </a>
          </div>
        </section>

        <FooterColumn title="PRODUCTO" links={['Simulación', 'Áreas', 'Aula Virtual']} />
        <FooterColumn title="COMPAÑÍA" links={['Sobre Nosotros', 'Contacto', 'Inicio']} />
        <FooterColumn title="LEGAL" links={['Términos', 'Privacidad', 'Cookies']} />

        <section className={styles.newsletter} aria-label="Newsletter">
          <h3>NEWSLETTER</h3>
          <p>Mantente al día con nuestras novedades</p>

          <form>
            <label className={styles.srOnly} htmlFor="newsletter-email">
              Correo electrónico
            </label>
            <input id="newsletter-email" type="email" placeholder="tu@email.com" />
          </form>
        </section>
      </div>
    </footer>
  );
}