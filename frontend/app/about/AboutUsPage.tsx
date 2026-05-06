import type { ReactNode } from 'react';
import styles from '../../styles/AboutUsPage.module.css';
import Footer from '../../components/Footer';

const navItems = ['Inicio', 'Áreas', 'Nosotros', 'Contacto', 'Simulación', 'Aula Virtual'];

const missionVision = [
  {
    title: 'Nuestra Misión',
    icon: 'target',
    text: 'Acompañar a cada profesional en su camino de descubrimiento, ayudándoles a identificar su estilo único, fortalecer su voz y desarrollar todo su potencial a través de simulaciones reales y significativas.',
  },
  {
    title: 'Nuestra Visión',
    icon: 'heart',
    text: 'Ser la plataforma líder en preparación profesional, reconocida por crear experiencias que van más allá de la evaluación, multiplicando sentido y propósito en cada simulación.',
  },
];

const values = [
  {
    title: 'Autenticidad',
    icon: 'users',
    text: 'Valoramos la genuinidad en cada interacción. No buscamos moldes, sino ayudar a cada persona a ser su mejor versión.',
  },
  {
    title: 'Excelencia',
    icon: 'award',
    text: 'Nos comprometemos a ofrecer experiencias de la más alta calidad, cuidando cada detalle del proceso.',
  },
  {
    title: 'Propósito',
    icon: 'heart',
    text: 'Cada simulación está diseñada con intención, buscando generar valor real y transformación profesional.',
  },
];

const team = [
  { name: 'Joaquin', role: 'PathMentor', area: 'Recursos Humanos', image: '/joaquin.jpg' },
  { name: 'Luis Fernandez', role: 'PathMentor', area: 'Finanzas', image: '/luis-fernandez.jpg' },
  { name: 'Erika Gaspar', role: 'PathMentor', area: 'Comercial', image: '/erika-gaspar.jpg' },
  { name: 'Jhoel Montes', role: 'PathMentor', area: 'Desarrollador', image: '/jhoel-montes.jpg' },
];

const stats = [
  { value: '+500', label: 'Usuarios Activos' },
  { value: '98%', label: 'Satisfacción' },
  { value: '+1000', label: 'Simulaciones' },
  { value: '50+', label: 'Empresas Aliadas' },
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

  if (name === 'users') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 19v-1.2c0-2-1.6-3.6-3.6-3.6H7.6c-2 0-3.6 1.6-3.6 3.6V19" />
        <circle cx="10" cy="7.5" r="3" />
        <path d="M20 19v-1.1c0-1.7-1.1-3.1-2.7-3.5" />
        <path d="M15.5 4.8a3 3 0 0 1 0 5.4" />
      </svg>
    );
  }

  if (name === 'award') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4.5" />
        <path d="m9 12.2-1.2 7 4.2-2.5 4.2 2.5-1.2-7" />
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
          <span className={styles.logoMark}><Icon name="target" /></span>
          <span className={styles.logoText}>PATH<br />FINDER</span>
        </a>

        <nav className={styles.nav} aria-label="Navegación principal">
          {navItems.map((item) => (
            <a key={item} className={item === 'Nosotros' ? styles.activeNav : undefined} href="#">
              {item}
            </a>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <button className={styles.iconOnly} aria-label="Favoritos">
            <Icon name="heart" />
          </button>
          <a className={styles.profileButton} href="#">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2" /><path d="M5.8 19c.7-3.2 3-5 6.2-5s5.5 1.8 6.2 5" /></svg>
            Perfil
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <span className={styles.pill}>✧ Nuestra Historia</span>
        <h1 id="about-title">Sobre PathFinder</h1>
        <p>Transformamos la manera en que las personas viven los procesos de selección,<br /> brindando experiencias auténticas y con propósito.</p>
      </div>
    </section>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className={styles.sectionTitle}>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function Card({ icon, title, children, compact = false }: { icon: string; title: string; children: ReactNode; compact?: boolean }) {
  return (
    <article className={`${styles.card} ${compact ? styles.compactCard : ''}`}>
      <div className={styles.cardIcon}><Icon name={icon} /></div>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

function MissionVision() {
  return (
    <section className={`${styles.section} ${styles.missionSection}`} aria-label="Misión y visión">
      <div className={styles.twoColumnGrid}>
        {missionVision.map((item) => (
          <Card key={item.title} icon={item.icon} title={item.title}>{item.text}</Card>
        ))}
      </div>
    </section>
  );
}

function Values() {
  return (
    <section className={styles.section} aria-labelledby="values-title">
      <SectionTitle title="Nuestros Valores" subtitle="Los principios que guían cada una de nuestras decisiones y acciones" />
      <div className={styles.threeColumnGrid}>
        {values.map((item) => (
          <Card key={item.title} icon={item.icon} title={item.title} compact>{item.text}</Card>
        ))}
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className={`${styles.section} ${styles.teamSection}`} aria-labelledby="team-title">
      <SectionTitle title="Nuestros PathMentors" subtitle="Un equipo de profesionales dedicados a guiarte en tu camino hacia el éxito" />
      <div className={styles.teamGrid}>
        {team.map((member) => (
          <article className={styles.teamCard} key={member.name}>
            <div className={styles.avatarFrame}>
              <img src={member.image} alt={member.name} className={styles.avatar} />
            </div>
            <h3>{member.name}</h3>
            <p className={styles.role}>{member.role}</p>
            <p className={styles.area}>{member.area}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className={styles.statsSection} aria-label="Indicadores">
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <article className={styles.statCard} key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className={styles.ctaSection} aria-labelledby="cta-title">
      <div className={styles.ctaCard}>
        <h2 id="cta-title">¿Listo para comenzar tu simulación?</h2>
        <p>Da el primer paso en tu desarrollo profesional con PathFinder</p>
        <a href="#" className={styles.ctaButton}>Comienza Ahora <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}

export default function AboutUsPage() {
  return (
    <main className={styles.pageShell}>
      <Header />
      <Hero />
      <MissionVision />
      <Values />
      <Team />
      <Stats />
      <CTA />
      <Footer />
    </main>
  );
}
