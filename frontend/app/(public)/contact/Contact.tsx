import Footer from '../../../components/Footer';
import styles from '../../../styles/ContactPage.module.css';

const navItems = ['Inicio', 'Áreas', 'Nosotros', 'Contacto', 'Simulación', 'Aula Virtual'];

const socialLinks = ['Facebook', 'Twitter', 'LinkedIn', 'Instagram'];

const faqs = [
  {
    question: '¿Cómo obtengo un código de acceso?',
    answer:
      'Los códigos son proporcionados por organizaciones asociadas o pueden ser adquiridos contactando a nuestro equipo.',
  },
  {
    question: '¿Cuánto tiempo tengo para completar la simulación?',
    answer: '',
  },
  {
    question: '¿Puedo repetir la simulación?',
    answer:
      'Sí, puedes solicitar un nuevo código de acceso para repetir el proceso. Contacta con nuestro equipo para más información.',
  },
];

function Icon({ name }: { name: string }) {
  if (name === 'target') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    );
  }

  if (name === 'mail') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="m5 7 7 6 7-6" />
      </svg>
    );
  }

  if (name === 'phone') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.5 5.5 6.4 7.6c-.7.7-.8 1.8-.2 2.6a31 31 0 0 0 7.6 7.6c.8.6 1.9.5 2.6-.2l2.1-2.1-3.2-3.2-1.7 1.7c-1.7-.9-3.2-2.4-4.1-4.1l1.7-1.7-3.3-3.2Z" />
      </svg>
    );
  }

  if (name === 'clock') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === 'send') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 3 10 14" />
        <path d="m21 3-7 18-4-7-7-4 18-7Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a className={styles.logo} href="#" aria-label="PathFinder">
          <span className={styles.logoMark}>
            <Icon name="target" />
          </span>
          <span className={styles.logoText}>
            PATH
            <br />
            FINDER
          </span>
        </a>

        <nav className={styles.nav} aria-label="Navegación principal">
          {navItems.map((item) => (
            <a key={item} className={item === 'Contacto' ? styles.activeNav : undefined} href="#">
              {item}
            </a>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <button className={styles.iconOnly} aria-label="Favoritos">
            <Icon name="heart" />
          </button>
          <a className={styles.profileButton} href="#">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5.8 19c.7-3.2 3-5 6.2-5s5.5 1.8 6.2 5" />
            </svg>
            Perfil
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="contact-title">
      <div className={styles.heroContent}>
        <span className={styles.heroPill}>Estamos aquí para ti</span>
        <h1 id="contact-title">Contáctanos</h1>
        <p>¿Tienes preguntas o necesitas ayuda? Estamos aquí para apoyarte</p>
      </div>
    </section>
  );
}

function ContactInfo() {
  return (
    <aside className={styles.infoStack} aria-label="Información de contacto">
      <article className={styles.infoCard}>
        <h2>Información de Contacto</h2>
        <p>Nuestro equipo está disponible para responder tus preguntas</p>

        <div className={styles.contactItem}>
          <span className={`${styles.contactIcon} ${styles.emailIcon}`}>
            <Icon name="mail" />
          </span>
          <div>
            <h3>Email</h3>
            <a href="mailto:contacto@pathfinder.com">contacto@pathfinder.com</a>
            <p>Respuesta en 24-48 horas</p>
          </div>
        </div>

        <div className={styles.contactItem}>
          <span className={`${styles.contactIcon} ${styles.phoneIcon}`}>
            <Icon name="phone" />
          </span>
          <div>
            <h3>Teléfono</h3>
            <a href="tel:+1234567890">+1 (234) 567-890</a>
            <p>Lun - Vie, 9:00 AM - 6:00 PM</p>
          </div>
        </div>

        <div className={styles.divider} />

        <section className={styles.socialSection} aria-label="Síguenos">
          <h3>Síguenos</h3>
          <div className={styles.socialGrid}>
            {socialLinks.map((social) => (
              <a href="#" key={social}>
                <span>{social === 'Facebook' ? 'f' : social === 'Twitter' ? '♥' : social === 'LinkedIn' ? 'in' : '◎'}</span>
                {social}
              </a>
            ))}
          </div>
        </section>
      </article>

      <article className={styles.hoursCard}>
        <h2>
          <Icon name="clock" />
          Horarios de Atención
        </h2>
        <dl>
          <div>
            <dt>Lunes - Viernes</dt>
            <dd>9:00 AM - 6:00 PM</dd>
          </div>
          <div>
            <dt>Sábados</dt>
            <dd>10:00 AM - 2:00 PM</dd>
          </div>
          <div>
            <dt>Domingos</dt>
            <dd>Cerrado</dd>
          </div>
        </dl>
      </article>
    </aside>
  );
}

function ContactForm() {
  return (
    <section className={styles.formCard} aria-labelledby="message-title">
      <h2 id="message-title">Envíanos un Mensaje</h2>
      <p>Completa el formulario y te responderemos pronto</p>

      <form className={styles.form}>
        <label>
          Nombre completo *
          <input type="text" />
        </label>

        <label>
          Correo electrónico *
          <input type="email" />
        </label>

        <label>
          Teléfono (opcional)
          <input type="tel" />
        </label>

        <label>
          Asunto *
          <select defaultValue="">
            <option value="" disabled>
              Selecciona un asunto
            </option>
            <option>Consulta general</option>
            <option>Soporte técnico</option>
            <option>Simulación</option>
          </select>
        </label>

        <label>
          Mensaje *
          <textarea />
        </label>

        <button type="submit">
          <Icon name="send" />
          Enviar Mensaje
        </button>
      </form>

      <aside className={styles.noticeBox}>
        <strong>RECUERDA:</strong>
        <p>Enviar email al equipo, guardar mensaje en BD, enviar confirmación automática al usuario.</p>
      </aside>
    </section>
  );
}

function ContactMain() {
  return (
    <section className={styles.contactSection} aria-label="Contacto">
      <div className={styles.contactGrid}>
        <ContactInfo />
        <ContactForm />
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className={styles.faqSection} aria-labelledby="faq-title">
      <div className={styles.sectionTitle}>
        <h2 id="faq-title">Preguntas Frecuentes</h2>
        <p>Encuentra respuestas rápidas a las consultas más comunes</p>
      </div>

      <div className={styles.faqList}>
        {faqs.map((faq) => (
          <article className={styles.faqCard} key={faq.question}>
            <h3>{faq.question}</h3>
            {faq.answer ? <p>{faq.answer}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <main className={styles.pageShell}>
      {/* <Header /> */}
      <Hero />
      <ContactMain />
      <FAQ />
      <Footer />
    </main>
  );
}
