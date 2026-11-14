import { useEffect, useRef, useState } from 'react';
import { profile, projects, skills } from './content.js';

const navItems = [['home', 'home'], ['works', 'works'], ['about-me', 'about-me'], ['contacts', 'contacts']];

function Icon({ name, size = 20, ...props }) {
  if (name === 'github' || name === 'email') {
    return <span className={`asset-icon icon-${name}`} style={{ width: size, height: size }} aria-hidden="true" {...props} />;
  }
  const paths = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M10 4H4v16h16v-6" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    location: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" /><path d="M15 4H4v11" /></>,
    phone: <path d="m8 3 3 5-3 3a14 14 0 0 0 5 5l3-3 5 3-2 5C10 22 2 14 3 5Z" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

function Brand({ footer = false }) {
  return <a className="brand" href="#home" aria-label={`${profile.shortName} — back to home`}>
    <svg width="25" height="25" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="m9 7-6 7 6 7m10-14 6 7-6 7M17 5l-6 18" stroke="currentColor" strokeWidth="2" /></svg>
    <span>{profile.shortName.toLowerCase()}<span className="accent">{footer ? '.' : '_'}</span></span>
  </a>;
}

function Dots({ className = '' }) {
  return <span className={`dots ${className}`} aria-hidden="true">{Array.from({ length: 25 }, (_, i) => <img key={i} src="/assets/template-dot.svg" width="4" height="4" alt="" />)}</span>;
}

function SectionHeading({ id, children, aside }) {
  return <div className="section-heading" data-reveal>
    <h2 id={id}><span className="accent">#</span>{children}</h2>
    <span className="heading-line" aria-hidden="true" />
    {aside && <span className="heading-aside">{aside}</span>}
  </div>;
}

function Portrait() {
  return <div className="portrait-scene">
    <span className="template-outline" aria-hidden="true" />
    <figure className="portrait-figure">
      <img className="portrait-image" src={profile.portrait} alt={profile.name} width="1086" height="1448" fetchPriority="high" />
      <span className="portrait-scan" aria-hidden="true" />
    </figure>
    <Dots className="hero-dots" />
    <span className="portrait-coordinate" aria-hidden="true">CEBU CITY / PHILIPPINES</span>
    <a className="current-project" href="#works">
      <span className="status-square" aria-hidden="true" />
      <span>Currently working on <strong>GarantiyAid</strong><small>Capstone project</small></span>
      <Icon name="arrow" size={18} />
    </a>
  </div>;
}

function ProjectPreview({ project }) {
  if (project.logo) return <div className="project-brand">
    <img className="project-brand-logo" src={project.logo} width="2048" height="2048" alt={`${project.title} logo`} loading="lazy" />
    <div className="project-brand-copy"><strong>{project.title}</strong><span>{project.logoCaption}</span></div>
  </div>;
  if (project.image) return <img src={project.image} width="1168" height="655" alt={project.imageAlt} loading="lazy" className="project-image" />;
  return <div className="missing-preview">
    <svg width="68" height="54" viewBox="0 0 68 54" fill="none" aria-hidden="true"><rect x="5" y="4" width="58" height="36" stroke="currentColor" /><path d="M23 50h22M34 40v10M17 16h11m-11 8h23m-23 8h15" stroke="currentColor" /><rect x="45" y="14" width="9" height="9" fill="currentColor" opacity=".3" /></svg>
    <strong>CCS<span className="accent">_</span>sit-in</strong>
    <span>Project screenshot coming soon</span>
    <small>PREVIEW PLACEHOLDER</small>
  </div>;
}

function ProjectCard({ project, onOpen, index }) {
  return <article className="project-card" data-reveal data-tilt style={{ '--reveal-delay': `${index * 70}ms` }}>
    <button className="project-preview" onClick={() => onOpen(project)} aria-label={`Explore ${project.title}`}>
      <ProjectPreview project={project} />
      <span className="preview-hover">Explore project <Icon name="external" size={16} /></span>
    </button>
    <ul className="project-stack" aria-label="Technologies">{project.stack.map(item => <li key={item}>{item}</li>)}</ul>
    <div className="project-body">
      <div className="project-meta"><span>{project.number} / {project.kind}</span>{project.status === 'In progress' && <span className="progress-label"><span />In progress</span>}</div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="project-actions">
        <button className="button button-small" onClick={() => onOpen(project)}>Details <span aria-hidden="true">&lt;~&gt;</span></button>
        <div className="project-sources">
          {project.source && <a className="source-link" href={project.source} target="_blank" rel="noreferrer" aria-label={`${project.title}${project.backendSource ? ' frontend' : ''} source on GitHub (opens new tab)`}><Icon name="github" size={21} /> {project.backendSource ? 'Frontend' : 'Code'} <span aria-hidden="true">↗</span></a>}
          {project.backendSource && <a className="source-link" href={project.backendSource} target="_blank" rel="noreferrer" aria-label={`${project.title} backend source on GitHub (opens new tab)`}><Icon name="github" size={21} /> Backend <span aria-hidden="true">↗</span></a>}
        </div>
      </div>
    </div>
  </article>;
}

function ProjectDialog({ project, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; opener?.focus(); };
  }, []);

  return <dialog ref={dialog} className="project-dialog" aria-labelledby="dialog-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-inner">
      <div className="dialog-top"><span>{project.kind}</span><button className="icon-button" onClick={onClose} aria-label="Close project details" autoFocus><Icon name="close" /></button></div>
      <h2 id="dialog-title"><span className="accent">#</span>{project.title}</h2>
      <div className="dialog-meta"><span>{project.role}</span><span>{project.date}</span></div>
      <p>{project.summary}</p>
      <h3>What’s inside</h3>
      <ul className="feature-list">{project.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      <ul className="tech-tags" aria-label="Full technology stack">{project.fullStack.map(item => <li key={item}>{item}</li>)}</ul>
      <div className="dialog-actions">
        {project.source && <a className="button" href={project.source} target="_blank" rel="noreferrer" aria-label={`${project.title}${project.backendSource ? ' frontend' : ''} source on GitHub (opens new tab)`}>{project.backendSource ? 'Frontend' : 'View source'} <Icon name="github" size={20} /></a>}
        {project.backendSource && <a className="button button-secondary" href={project.backendSource} target="_blank" rel="noreferrer" aria-label={`${project.title} backend source on GitHub (opens new tab)`}>Backend <Icon name="github" size={20} /></a>}
        {project.live ? <a className="button button-secondary" href={project.live} onClick={onClose}>Live demo <Icon name="arrow" size={18} /></a> : <span className="live-placeholder">Live demo link coming soon</span>}
      </div>
    </div>
  </dialog>;
}

function Header({ active }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const navigation = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    navigation.current?.querySelector('a')?.focus();
    function handleKey(event) {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab') {
        const links = navigation.current.querySelectorAll('a');
        const first = menuButton.current;
        const last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    const wide = window.matchMedia('(min-width: 761px)');
    function closeOnWide() { if (wide.matches) setMenuOpen(false); }
    wide.addEventListener('change', closeOnWide);
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKey); wide.removeEventListener('change', closeOnWide); };
  }, [menuOpen]);

  return <header className={`site-header ${menuOpen ? 'menu-open' : ''}`}>
    <div className="container header-inner">
      <Brand />
      <button ref={menuButton} className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      <nav ref={navigation} id="main-navigation" aria-label="Main navigation">
        {navItems.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}><span>#</span>{label}</a>)}
        <a className="nav-resume" href={profile.resume} download>résumé <Icon name="download" size={15} /></a>
        <span className="mobile-menu-note">Cebu City, PH<br /><span className="accent">&lt; let’s build something /&gt;</span></span>
      </nav>
    </div>
  </header>;
}

function App() {
  const [active, setActive] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');
  const copyTimer = useRef(null);
  const scrollProgress = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reveals = document.querySelectorAll('[data-reveal]');
    let revealObserver;
    if (!reduceMotion.matches && 'IntersectionObserver' in window) {
      document.documentElement.classList.add('motion-ready');
      revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target); }
      }), { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(element => revealObserver.observe(element));
    }

    const pointerMotion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const tiltCleanups = Array.from(document.querySelectorAll('[data-tilt]'), card => {
      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;
      function move(event) {
        if (!pointerMotion.matches || event.pointerType === 'touch') return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const bounds = card.getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width));
          const y = Math.max(0, Math.min(1, (pointerY - bounds.top) / bounds.height));
          card.style.setProperty('--tilt-x', `${(0.5 - y) * 1.8}deg`);
          card.style.setProperty('--tilt-y', `${(x - 0.5) * 1.8}deg`);
        });
      }
      function reset() {
        cancelAnimationFrame(frame);
        frame = 0;
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      }
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', reset);
      pointerMotion.addEventListener('change', reset);
      return () => {
        reset();
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', reset);
        pointerMotion.removeEventListener('change', reset);
      };
    });

    let scrollFrame = 0;
    function updateScroll() {
      scrollFrame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
      if (scrollProgress.current) scrollProgress.current.style.transform = `scaleX(${progress})`;
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) {
        setActive('contacts');
        return;
      }
      const marker = window.scrollY + window.innerHeight * 0.35;
      const sections = navItems.map(([id]) => document.getElementById(id));
      const current = sections.filter(section => section.offsetTop <= marker).at(-1);
      if (current) setActive(current.id);
    }
    function queueScroll() {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
    }
    updateScroll();
    window.addEventListener('scroll', queueScroll, { passive: true });
    window.addEventListener('resize', queueScroll);
    return () => {
      revealObserver?.disconnect();
      document.documentElement.classList.remove('motion-ready');
      tiltCleanups.forEach(cleanup => cleanup());
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', queueScroll);
      window.removeEventListener('resize', queueScroll);
      clearTimeout(copyTimer.current);
    };
  }, []);

  async function copyEmail() {
    try { await navigator.clipboard.writeText(profile.email); setCopyMessage('Email copied to clipboard.'); }
    catch { setCopyMessage('Copy unavailable. You can select the email address or use the email link.'); }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyMessage(''), 4500);
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="scroll-progress" aria-hidden="true"><span ref={scrollProgress} /></div>
    <Header active={active} />
    <aside className="social-rail" aria-label="Social and contact links"><span className="rail-line" aria-hidden="true" /><a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub (opens new tab)"><Icon name="github" size={27} /></a><a href={`mailto:${profile.email}`} aria-label={'Email ' + profile.shortName}><Icon name="email" size={27} /></a><a href={profile.resume} download aria-label="Download résumé"><Icon name="download" size={23} /></a><span className="rail-caption" aria-hidden="true">build. learn. repeat.</span></aside>
    <main id="main">
      <section id="home" className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-enter"><span className="accent">&gt;</span> hello, world<span className="cursor" aria-hidden="true">_</span></p>
          <h1 id="hero-title" className="hero-enter">{profile.shortName} is an <span className="accent">IT student</span> &amp; <span className="accent">full-stack developer.</span></h1>
          <p className="hero-description hero-enter">Turning ideas into responsive websites and practical web applications. Based in Cebu, always learning.</p>
          <div className="hero-actions hero-enter"><a className="button" href="#works">View my work <span aria-hidden="true">~~&gt;</span></a><a className="text-link" href="#contacts">Let’s talk <span aria-hidden="true">↗</span></a></div>
          <p className="hero-footnote hero-enter"><span className="availability-dot" />Open to internship opportunities</p>
        </div>
        <div className="hero-visual"><Portrait /></div>
      </section>

      <div className="quote-section container" data-reveal>
        <figure className="quote-block"><span className="quote-mark quote-open" aria-hidden="true" /><blockquote>One line at a time.<br className="quote-mobile-break" /> One step closer.</blockquote><figcaption>— a developer’s mindset</figcaption><span className="quote-mark quote-close" aria-hidden="true" /></figure>
        <span className="edge-square quote-square" aria-hidden="true" />
      </div>

      <section id="works" className="section projects-section container" aria-labelledby="projects-heading">
        <SectionHeading id="projects-heading" aside={<a className="text-link" href={profile.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">~~&gt;</span><span className="sr-only"> (opens new tab)</span></a>}>projects</SectionHeading>
        <p className="section-intro" data-reveal>A few things I’ve built. A lot I’ve learned.</p>
        <div className="project-grid">{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onOpen={setSelectedProject} />)}</div>
        <Dots className="projects-edge-dots" />
      </section>

      <section id="skills" className="section skills-section container" aria-labelledby="skills-heading">
        <SectionHeading id="skills-heading" aside={<span className="section-counter">01 / always growing</span>}>skills</SectionHeading>
        <div className="skills-layout">
          <div className="skills-art" aria-hidden="true" data-reveal><Dots className="skills-dots-one" /><span className="skill-square-one" /><span className="template-geometric" /><Dots className="skills-dots-two" /><span className="skill-square-two" /><span className="skills-art-caption">&lt; tools of the trade /&gt;</span></div>
          <div className="skills-grid">{skills.map((group, index) => <div key={group.title} className={`skill-box ${group.learning ? 'learning-box' : ''} ${group.title === 'Networking' ? 'networking-box' : ''}`} data-reveal style={{ '--reveal-delay': `${Math.min(index * 70, 330)}ms` }}><h3>{group.title}{group.learning && <span className="learning-dot" aria-hidden="true" />}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div>
        </div>
      </section>

      <section id="about-me" className="section about-section container" aria-labelledby="about-heading">
        <SectionHeading id="about-heading">about-me</SectionHeading>
        <div className="about-layout">
          <div className="about-copy" data-reveal>
            <p className="about-hello">Hello, I’m {profile.name}<span className="accent">!</span></p>
            <p>I’m a <strong>full-stack web developer</strong> with <strong>basic UI/UX design skills</strong>, focused on building practical, user-friendly web applications with React, JavaScript, and Node.js. I’m currently developing <a className="about-project-link" href="#works">GarantiyAid</a>, a social assistance management system that helps organize beneficiary records, assistance programs, and aid distribution, while completing my BS Information Technology degree at the University of Cebu (Main), with graduation expected in 2027.</p>
            <p>I also enjoy UI/UX design and am still learning, exploring Figma and Framer to improve how I create clear, intuitive interfaces. Alongside web development, I have a basic understanding of computer networking and Cisco fundamentals.</p>
            <a className="button" href={profile.resume} download>Download résumé <Icon name="download" size={18} /></a>
          </div>
          <div className="about-terminal" data-reveal><div className="terminal-top"><span><i /><i /><i /></span><span>about-me.js</span><span>JS</span></div><div className="terminal-code"><div><span className="line-number">01</span><code><span className="code-keyword">const</span> {profile.shortName.toLowerCase()} = {'{'}</code></div><div><span className="line-number">02</span><code>&nbsp; location: <span className="code-string">'Cebu, PH'</span>,</code></div><div><span className="line-number">03</span><code>&nbsp; degree: <span className="code-string">'BSIT'</span>,</code></div><div><span className="line-number">04</span><code>&nbsp; university: <span className="code-string">'UC Main'</span>,</code></div><div><span className="line-number">05</span><code>&nbsp; graduating: <span className="code-orange">2027</span>,</code></div><div><span className="line-number">06</span><code>&nbsp; focus: [</code></div><div><span className="line-number">07</span><code>&nbsp;&nbsp;&nbsp; <span className="code-string">'web development'</span>,</code></div><div><span className="line-number">08</span><code>&nbsp;&nbsp;&nbsp; <span className="code-string">'basic UI/UX'</span></code></div><div><span className="line-number">09</span><code>&nbsp; ],</code></div><div><span className="line-number">10</span><code>&nbsp; learning: <span className="code-orange">true</span></code></div><div><span className="line-number">11</span><code>{'}'};</code></div><div className="terminal-comment"><span className="line-number">12</span><code>// a work in progress, always.</code></div></div><div className="terminal-bottom"><span><span className="availability-dot" /> ready to learn</span><span>UTF-8</span></div><Dots className="terminal-dots" /></div>
        </div>
        <span className="edge-square about-square" aria-hidden="true" />
      </section>

      <section id="contacts" className="section contact-section container" aria-labelledby="contact-heading">
        <SectionHeading id="contact-heading">contacts</SectionHeading>
        <div className="contact-layout"><div className="contact-copy" data-reveal><p className="contact-title">Let’s build something<span className="accent">.</span></p><p>Have an internship opportunity, a project idea, or just want to say hello? I’d love to hear from you.</p><p className="contact-location"><Icon name="location" size={17} />{profile.location}</p></div><div className="contact-panel" data-reveal><h3><span className="availability-dot" />Message me here</h3><div className="email-row"><a href={`mailto:${profile.email}`}><Icon name="email" size={25} /><span>{profile.email}</span></a><button className="icon-button copy-button" onClick={copyEmail} aria-label="Copy email address"><Icon name="copy" size={17} /></button></div><a className="contact-github" href={profile.github} target="_blank" rel="noreferrer"><Icon name="github" size={25} /><span>github.com/Bryllando</span><Icon name="external" size={14} /><span className="sr-only"> (opens new tab)</span></a><a className="contact-phone" href={profile.phoneHref}><Icon name="phone" size={20} /><span>{profile.phone}</span></a><div className="contact-panel-footer"><a href={`mailto:${profile.email}`}>Say hello <span aria-hidden="true">~~&gt;</span></a><span>let’s connect.</span></div><p className="copy-feedback" role="status">{copyMessage}</p></div></div>
      </section>
    </main>
    <footer className="site-footer"><div className="container"><div className="footer-main"><div><Brand footer /><p>IT student. Web developer. Always learning.</p></div><div className="footer-media"><span>Find me online</span><div><a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub (opens new tab)"><Icon name="github" size={28} /></a><a href={`mailto:${profile.email}`} aria-label={'Email ' + profile.shortName}><Icon name="email" size={28} /></a><a href={profile.resume} download aria-label="Download résumé"><Icon name="download" size={21} /></a></div></div></div><div className="footer-bottom"><p>© {new Date().getFullYear()} {profile.name}</p><p>Built with React <span className="accent">&lt;/&gt;</span> Designed to keep growing.</p></div></div></footer>
    {selectedProject && <ProjectDialog key={selectedProject.id} project={selectedProject} onClose={() => setSelectedProject(null)} />}
  </>;
}

export default App;
