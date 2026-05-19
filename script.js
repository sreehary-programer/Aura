/* ═══════════════════════════════════════════════════════════
   AURA — Premium Landing Page Script
   Modular vanilla JS — no frameworks, no libraries
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utilities ────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const raf = requestAnimationFrame;

/* ═══════════════════════════════════════════════════════════
   MODULE: Loader
   ═══════════════════════════════════════════════════════════ */
const Loader = (() => {
  const loader = $('#loader');
  if (!loader) return;

  const DURATION = 2000;

  const hide = () => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
  };

  const init = () => {
    document.body.classList.add('loading');
    setTimeout(hide, DURATION);
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Custom Cursor
   ═══════════════════════════════════════════════════════════ */
const Cursor = (() => {
  const cursor = $('#cursor');
  const follower = $('#cursor-follower');
  if (!cursor || !follower) return { init: () => {} };

  let mx = -100, my = -100;
  let fx = -100, fy = -100;
  let running = false;

  const updateCursor = () => {
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';

    fx = lerp(fx, mx, 0.12);
    fy = lerp(fy, my, 0.12);
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';

    raf(updateCursor);
  };

  const init = () => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });

    // Scale on interactive elements
    const interactables = 'a, button, input, textarea, [data-hover]';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(interactables)) {
        follower.style.width = '50px';
        follower.style.height = '50px';
        follower.style.opacity = '0.3';
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(interactables)) {
        follower.style.width = '32px';
        follower.style.height = '32px';
        follower.style.opacity = '0.5';
      }
    });

    if (!running) { running = true; updateCursor(); }
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Mouse Glow
   ═══════════════════════════════════════════════════════════ */
const MouseGlow = (() => {
  const glow = $('#mouse-glow');
  if (!glow) return { init: () => {} };

  let gx = 0, gy = 0, tx = 0, ty = 0;
  let rafId;

  const animate = () => {
    gx = lerp(gx, tx, 0.06);
    gy = lerp(gy, ty, 0.06);
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    rafId = raf(animate);
  };

  const init = () => {
    if (window.matchMedia('(pointer: coarse)').matches) { glow.style.display = 'none'; return; }
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    animate();
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Scroll Progress
   ═══════════════════════════════════════════════════════════ */
const ScrollProgress = (() => {
  const bar = $('#scroll-progress');
  if (!bar) return { init: () => {} };

  const update = () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = pct + '%';
  };

  const init = () => {
    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Navbar
   ═══════════════════════════════════════════════════════════ */
const Navbar = (() => {
  const nav = $('#navbar');
  const burger = $('#nav-burger');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-link');
  if (!nav) return { init: () => {} };

  let isOpen = false;

  const setScrolled = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  const toggleMenu = () => {
    isOpen = !isOpen;
    burger.classList.toggle('active', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;
    burger.classList.remove('active');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  // Smooth scroll for all anchor links
  const smoothScroll = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    const offset = nav.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const init = () => {
    window.addEventListener('scroll', setScrolled, { passive: true });
    setScrolled();
    burger.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', smoothScroll));
    $$('.nav-link, a[href^="#"]').forEach(a => a.addEventListener('click', smoothScroll));

    // Close on outside click
    document.addEventListener('click', e => {
      if (isOpen && !nav.contains(e.target)) closeMenu();
    });
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Theme Toggle
   ═══════════════════════════════════════════════════════════ */
const ThemeToggle = (() => {
  const btn = $('#theme-toggle');
  const root = document.documentElement;
  const body = document.body;
  if (!btn) return { init: () => {} };

  const STORAGE_KEY = 'aura-theme';
  let current = localStorage.getItem(STORAGE_KEY) || 'dark';

  const apply = (theme) => {
    body.setAttribute('data-theme', theme);
    root.setAttribute('data-theme', theme);
    current = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  };

  const toggle = () => apply(current === 'dark' ? 'light' : 'dark');

  const init = () => {
    apply(current);
    btn.addEventListener('click', toggle);
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Scroll Reveal
   ═══════════════════════════════════════════════════════════ */
const ScrollReveal = (() => {
  const els = $$('.reveal-up');
  if (!els.length) return { init: () => {} };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  const init = () => els.forEach(el => observer.observe(el));

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Particles
   ═══════════════════════════════════════════════════════════ */
const Particles = (() => {
  const canvas = $('#particles-canvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  const particles = [];
  const COUNT = window.innerWidth < 768 ? 40 : 80;
  let W, H, animId;

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.r = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.life = 1;
      this.decay = Math.random() * 0.002 + 0.001;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.life * this.alpha;
      ctx.fillStyle = '#c8a96e';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };

  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = raf(loop);
  };

  const init = () => {
    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    loop();
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Testimonials Carousel (mobile)
   ═══════════════════════════════════════════════════════════ */
const Testimonials = (() => {
  const track = $('#testimonials-track');
  const dotsContainer = $('#tnav-dots');
  const prevBtn = $('#tnav-prev');
  const nextBtn = $('#tnav-next');
  if (!track) return { init: () => {} };

  let current = 0;
  const cards = $$('.testimonial-card', track);
  let dots = [];

  const goTo = (idx) => {
    current = (idx + cards.length) % cards.length;
    cards.forEach((c, i) => {
      c.style.transform = `translateX(${(i - current) * 110}%)`;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const buildDots = () => {
    dotsContainer.innerHTML = '';
    dots = cards.map((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'tnav-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Testimonial ${i + 1}`);
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(btn);
      return btn;
    });
  };

  const isMobile = () => window.innerWidth <= 768;

  const setup = () => {
    if (isMobile()) {
      cards.forEach((c, i) => {
        c.style.position = 'absolute';
        c.style.width = '100%';
        c.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';
        c.style.transform = `translateX(${i === 0 ? '0' : '110%'})`;
      });
      track.style.position = 'relative';
      track.style.overflow = 'hidden';
      track.style.minHeight = '260px';
      buildDots();
      goTo(0);
    } else {
      cards.forEach(c => {
        c.style.position = '';
        c.style.width = '';
        c.style.transition = '';
        c.style.transform = '';
      });
      track.style.position = '';
      track.style.overflow = '';
      track.style.minHeight = '';
    }
  };

  const init = () => {
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    });

    setup();
    window.addEventListener('resize', setup, { passive: true });

    // Auto-advance
    setInterval(() => { if (isMobile()) goTo(current + 1); }, 5000);
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Pricing Toggle
   ═══════════════════════════════════════════════════════════ */
const PricingToggle = (() => {
  const monthlyBtn = $('#pt-monthly');
  const yearlyBtn = $('#pt-yearly');
  const amounts = $$('.pcard-amount');
  if (!monthlyBtn) return { init: () => {} };

  let isYearly = false;

  const update = () => {
    amounts.forEach(el => {
      const val = isYearly ? el.dataset.yearly : el.dataset.monthly;
      el.style.transform = 'translateY(-4px)';
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = val;
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
        el.style.transition = 'transform 0.3s, opacity 0.3s';
      }, 150);
    });
    monthlyBtn.classList.toggle('active', !isYearly);
    yearlyBtn.classList.toggle('active', isYearly);
    monthlyBtn.setAttribute('aria-pressed', !isYearly);
    yearlyBtn.setAttribute('aria-pressed', isYearly);
  };

  const init = () => {
    monthlyBtn.addEventListener('click', () => { isYearly = false; update(); });
    yearlyBtn.addEventListener('click', () => { isYearly = true; update(); });
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Contact Form
   ═══════════════════════════════════════════════════════════ */
const ContactForm = (() => {
  const form = $('#contact-form');
  if (!form) return { init: () => {} };

  const submit = $('#form-submit');
  const btnText = $('#form-btn-text');
  const success = $('#form-success');

  const setLoading = (isLoading) => {
    submit.disabled = isLoading;
    btnText.textContent = isLoading ? 'Sending…' : 'Send Message';
    submit.style.opacity = isLoading ? '0.7' : '1';
  };

  const showSuccess = () => {
    success.hidden = false;
    success.style.opacity = '0';
    success.style.transform = 'translateY(8px)';
    setTimeout(() => {
      success.style.transition = 'opacity 0.4s, transform 0.4s';
      success.style.opacity = '1';
      success.style.transform = 'translateY(0)';
    }, 10);
    form.reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fields = $$('input[required], textarea[required]', form);
    let valid = true;
    fields.forEach(f => {
      if (!f.value.trim()) {
        f.style.borderColor = 'var(--danger)';
        valid = false;
      } else {
        f.style.borderColor = '';
      }
    });
    if (!valid) return;

    setLoading(true);
    // Simulate async submit
    setTimeout(() => {
      setLoading(false);
      showSuccess();
    }, 1600);
  };

  const init = () => {
    form.addEventListener('submit', handleSubmit);
    // Clear red borders on input
    $$('input, textarea', form).forEach(f => {
      f.addEventListener('input', () => { f.style.borderColor = ''; });
    });
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Hero Parallax
   ═══════════════════════════════════════════════════════════ */
const HeroParallax = (() => {
  const orbs = $$('.hero-orb');
  if (!orbs.length) return { init: () => {} };

  const init = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 0.08;
        orb.style.transform = `translateY(${y * speed}px)`;
      });
    }, { passive: true });
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Number Counter Animation
   ═══════════════════════════════════════════════════════════ */
const CounterAnim = (() => {
  const targets = $$('.badge-num');
  if (!targets.length) return { init: () => {} };

  const animate = (el) => {
    const text = el.textContent;
    const match = text.match(/[\d.]+/);
    if (!match) return;
    const end = parseFloat(match[0]);
    const suffix = text.replace(match[0], '');
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = end * eased;
      el.textContent = (Number.isInteger(end) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) raf(step);
    };
    raf(step);
  };

  const init = () => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); observer.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    targets.forEach(t => observer.observe(t));
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Wave Animation (product showcase)
   ═══════════════════════════════════════════════════════════ */
const WaveAnim = (() => {
  const svg = $('svg', $('.sui-wave'));
  if (!svg) return { init: () => {} };

  const path = svg.querySelector('path');
  if (!path) return { init: () => {} };

  let t = 0;

  const generateWave = (offset) => {
    const pts = [];
    for (let x = 0; x <= 200; x += 10) {
      const y = 30 + Math.sin((x / 30) + offset) * 12 + Math.sin((x / 15) + offset * 1.5) * 5;
      pts.push(`${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const loop = () => {
    t += 0.03;
    path.setAttribute('d', generateWave(t));
    raf(loop);
  };

  const init = () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) loop();
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Newsletter
   ═══════════════════════════════════════════════════════════ */
const Newsletter = (() => {
  const btn = $('.newsletter-btn');
  const input = $('#newsletter-email');
  if (!btn || !input) return { init: () => {} };

  const init = () => {
    btn.addEventListener('click', () => {
      const email = input.value.trim();
      if (!email || !email.includes('@')) {
        input.style.color = 'var(--danger)';
        setTimeout(() => { input.style.color = ''; }, 1500);
        return;
      }
      btn.textContent = '✓';
      btn.style.background = 'var(--success)';
      input.value = '';
      input.placeholder = 'You\'re on the list!';
      setTimeout(() => {
        btn.textContent = '→';
        btn.style.background = '';
        input.placeholder = 'Enter your email';
      }, 3000);
    });
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Button Ripple
   ═══════════════════════════════════════════════════════════ */
const ButtonRipple = (() => {
  const addRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: 4px; height: 4px;
      border-radius: 50%;
      background: rgba(255,255,255,0.35);
      left: ${x}px; top: ${y}px;
      transform: translate(-50%, -50%) scale(0);
      animation: rippleAnim 0.5s ease-out forwards;
      pointer-events: none;
    `;
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `@keyframes rippleAnim { to { transform: translate(-50%,-50%) scale(60); opacity: 0; } }`;
      document.head.appendChild(style);
    }
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const init = () => {
    $$('.btn').forEach(btn => btn.addEventListener('click', addRipple));
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Active Nav Link (scroll spy)
   ═══════════════════════════════════════════════════════════ */
const ScrollSpy = (() => {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return { init: () => {} };

  const update = () => {
    let current = '';
    const offset = 120;
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top < offset) current = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color = href === current ? 'var(--accent)' : '';
    });
  };

  const init = () => {
    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Feature Card Magnetic Effect
   ═══════════════════════════════════════════════════════════ */
const MagneticCards = (() => {
  const cards = $$('.feature-card, .pricing-card');
  if (!cards.length) return { init: () => {} };

  const init = () => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `translateY(-4px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
        card.style.transition = 'transform 0.1s';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
    });
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Spec Item Hover
   ═══════════════════════════════════════════════════════════ */
const SpecItems = (() => {
  const items = $$('.spec-item');
  const init = () => {
    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.paddingLeft = '8px';
        item.style.transition = 'padding 0.2s';
        item.querySelector('.spec-val').style.color = 'var(--accent)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.paddingLeft = '';
        item.querySelector('.spec-val').style.color = '';
      });
    });
  };
  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   MODULE: Typing Eyebrow (hero)
   ═══════════════════════════════════════════════════════════ */
const TypingEffect = (() => {
  const el = $('.hero-eyebrow');
  if (!el) return { init: () => {} };

  const init = () => {
    // Subtle glow pulse on accent elements
    const accents = $$('.logo-mark, .eyebrow-dot');
    accents.forEach(a => {
      setInterval(() => {
        a.style.textShadow = '0 0 12px var(--accent)';
        setTimeout(() => { a.style.textShadow = ''; }, 800);
      }, 3000);
    });
  };

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   INIT — Boot all modules
   ═══════════════════════════════════════════════════════════ */
const App = {
  modules: [
    Loader,
    Cursor,
    MouseGlow,
    ScrollProgress,
    Navbar,
    ThemeToggle,
    ScrollReveal,
    Particles,
    Testimonials,
    PricingToggle,
    ContactForm,
    HeroParallax,
    CounterAnim,
    WaveAnim,
    Newsletter,
    ButtonRipple,
    ScrollSpy,
    MagneticCards,
    SpecItems,
    TypingEffect,
  ],

  init() {
    this.modules.forEach(mod => {
      if (mod && typeof mod.init === 'function') {
        try { mod.init(); }
        catch (e) { console.warn('[AURA]', e); }
      }
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
