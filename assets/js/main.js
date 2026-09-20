document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initNavigation();
  initScrollUI();
  initReveal();
  initCardSpotlight();
  initCounters();
  initFormValidation();
  initConfigurator();
  initAnatomyExplorer();
  setActiveNavLink();
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   Theme
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = localStorage.getItem('theme');

  let currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(currentTheme);
      localStorage.setItem('theme', currentTheme);
    });
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcons('moon');
  } else {
    document.documentElement.removeAttribute('data-theme');
    updateThemeIcons('sun');
  }
}

function updateThemeIcons(icon) {
  const toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(toggle => {
    if (icon === 'moon') {
      toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    } else {
      toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    }
  });
}

/* --------------------------------------------------------------------------
   RTL
   -------------------------------------------------------------------------- */
function initRTL() {
  const rtlToggles = document.querySelectorAll('.rtl-toggle');

  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      if (isRTL) {
        document.documentElement.removeAttribute('dir');
      } else {
        document.documentElement.setAttribute('dir', 'rtl');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Navigation & drawer
   -------------------------------------------------------------------------- */
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const drawerClose = document.querySelector('.drawer-close');

  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer .nav-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });
}

function openDrawer() {
  document.body.classList.add('drawer-open');
}

function closeDrawer() {
  document.body.classList.remove('drawer-open');
}

function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar .nav-link, .drawer .nav-link');

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* --------------------------------------------------------------------------
   Scroll chrome: condensed navbar + reading progress
   -------------------------------------------------------------------------- */
function initScrollUI() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // A dark hero lets the bar sit transparent over it; every other page needs glass from the start.
  const hero = document.querySelector('.hero-section, .page-hero');
  document.body.classList.add(hero ? 'nav-over-hero' : 'nav-solid');

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    navbar.classList.toggle('is-scrolled', y > 24);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? `${Math.min((y / max) * 100, 100)}%` : '0%';
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* --------------------------------------------------------------------------
   Scroll reveal — tagged elements plus sensible defaults on every page
   -------------------------------------------------------------------------- */
function initReveal() {
  const autoTargets = document.querySelectorAll(
    '.card, .section-header, .service-block > *, .quote-card, .stat-tile, .process-step, .form-panel'
  );

  autoTargets.forEach(el => {
    if (!el.hasAttribute('data-reveal') && !el.closest('.hero-section, .hero-split')) {
      el.setAttribute('data-reveal', '');
    }
  });

  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  // Stagger siblings so rows of cards cascade instead of popping together.
  const seen = new Map();
  targets.forEach(el => {
    if (el.style.getPropertyValue('--reveal-delay')) return;
    const parent = el.parentElement;
    const index = seen.get(parent) || 0;
    seen.set(parent, index + 1);
    el.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 90}ms`);
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Cursor-tracked card spotlight
   -------------------------------------------------------------------------- */
function initCardSpotlight() {
  if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });
}

/* --------------------------------------------------------------------------
   Count-up metrics — any [data-count] element
   -------------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const run = el => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-count-suffix') || '';
    const prefix = el.getAttribute('data-count-prefix') || '';
    const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);

    if (prefersReducedMotion) {
      el.textContent = prefix + formatNumber(target, decimals) + suffix;
      return;
    }

    const duration = 1600;
    const start = performance.now();

    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + formatNumber(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(run);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        run(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function formatNumber(n, decimals = 0) {
  return decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US');
}

/* --------------------------------------------------------------------------
   Form validation
   -------------------------------------------------------------------------- */
function initFormValidation() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let isValid = true;

    const name = document.getElementById('fullName');
    const email = document.getElementById('email');
    const company = document.getElementById('companyName');

    document.querySelectorAll('.form-control').forEach(el => {
      el.classList.remove('is-invalid');
    });

    if (!name.value.trim()) {
      setInvalid(name);
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      setInvalid(email);
      isValid = false;
    }

    if (!company.value.trim()) {
      setInvalid(company);
      isValid = false;
    }

    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    const hasChecked = Array.from(checkboxes).some(cb => cb.checked);
    const cbError = document.getElementById('systemsError');

    if (!hasChecked && checkboxes.length > 0) {
      if (cbError) cbError.style.display = 'block';
      isValid = false;
    } else if (cbError) {
      cbError.style.display = 'none';
    }

    if (isValid) {
      const successMsg = document.getElementById('formSuccessMsg');
      if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        form.reset();

        setTimeout(() => {
          successMsg.style.display = 'none';
        }, 5000);
      }
    }
  });
}

function setInvalid(element) {
  element.classList.add('is-invalid');
}

/* ==========================================================================
   Interactive module A — Airflow Sizing Configurator (index.html)
   Engineering defaults are industry rules of thumb, not a stamped design.
   ========================================================================== */
const CFG_PROFILES = {
  wood: {
    label: 'Woodworking',
    ach: 8,              // air changes per hour
    cfmPerPoint: 800,    // capture volume per pickup point
    ductVelocity: 4000,  // fpm required to keep chips airborne
    airToCloth: 3.0,     // cfm per sq ft of filter media
    staticPressure: 11,  // in. w.g.
    merv: 15,
    media: 'Spun-bond polyester, 80/20 blend',
    code: 'NFPA 664',
    note: 'Wood dust is combustible. Layout includes spark detection and an abort gate ahead of the collector.'
  },
  metal: {
    label: 'Metal & Welding',
    ach: 6,
    cfmPerPoint: 1100,
    ductVelocity: 3500,
    airToCloth: 2.4,
    staticPressure: 12,
    merv: 16,
    media: 'Nanofiber cartridge, flame-retardant',
    code: 'OSHA 1910.252',
    note: 'Hexavalent chromium duty. Source capture is sized at the arm, with ambient push-pull as the second stage.'
  },
  powder: {
    label: 'Powder & Bulk',
    ach: 10,
    cfmPerPoint: 1400,
    ductVelocity: 4500,
    airToCloth: 2.0,
    staticPressure: 14,
    merv: 16,
    media: 'PTFE-membrane bags, anti-static',
    code: 'NFPA 652',
    note: 'A dust hazard analysis drives explosion venting, isolation valves and grounded, anti-static media.'
  },
  pharma: {
    label: 'Pharma & Cleanroom',
    ach: 12,
    cfmPerPoint: 600,
    ductVelocity: 3000,
    airToCloth: 1.8,
    staticPressure: 9,
    merv: 17,
    media: 'HEPA H14 final stage, bag-in/bag-out',
    code: 'ISO 14644',
    note: 'Containment duty. Safe-change housings and validated HEPA integrity testing are part of commissioning.'
  }
};

function initConfigurator() {
  const root = document.getElementById('airflowConfigurator');
  if (!root) return;

  const state = {
    profile: 'wood',
    area: 25000,
    points: 12,
    shifts: 2
  };

  const areaInput = root.querySelector('#cfgArea');
  const pointsInput = root.querySelector('#cfgPoints');
  const areaOut = root.querySelector('#cfgAreaOut');
  const pointsOut = root.querySelector('#cfgPointsOut');

  const out = {
    cfm: root.querySelector('#cfgCfm'),
    duct: root.querySelector('#cfgDuct'),
    filter: root.querySelector('#cfgFilter'),
    power: root.querySelector('#cfgPower'),
    service: root.querySelector('#cfgService'),
    trunks: root.querySelector('#cfgTrunks'),
    energy: root.querySelector('#cfgEnergy'),
    media: root.querySelector('#cfgMedia'),
    code: root.querySelector('#cfgCode'),
    note: root.querySelector('#cfgNote'),
    velocity: root.querySelector('#cfgVelocity'),
    stream: root.querySelector('#cfgStream')
  };

  // Animate a number from its current displayed value to the next one.
  // Dragging a slider passes `immediate` so we track the handle 1:1 instead of
  // restarting seven tweens per input event, which is what made it stutter.
  const tweens = new WeakMap();
  function setMetric(el, value, decimals = 0, immediate = false) {
    if (!el) return;
    const from = parseFloat(el.dataset.raw || '0');
    el.dataset.raw = String(value);

    if (prefersReducedMotion || immediate) {
      if (tweens.has(el)) cancelAnimationFrame(tweens.get(el));
      el.textContent = formatMetric(value, decimals);
      return;
    }

    if (tweens.has(el)) cancelAnimationFrame(tweens.get(el));

    const start = performance.now();
    const duration = 520;

    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatMetric(from + (value - from) * eased, decimals);
      if (p < 1) tweens.set(el, requestAnimationFrame(step));
    };

    tweens.set(el, requestAnimationFrame(step));
  }

  function formatMetric(value, decimals) {
    return decimals
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString('en-US');
  }

  function compute() {
    const p = CFG_PROFILES[state.profile];
    const ceiling = 20; // ft, typical industrial bay

    const dilution = (state.area * ceiling * p.ach) / 60;
    const capture = state.points * p.cfmPerPoint;
    const cfm = Math.round((dilution * 0.45 + capture) / 50) * 50;

    // Past ~28k CFM the volume is split across parallel trunks rather than one
    // absurdly large main, so diameter is sized per trunk.
    const trunks = Math.max(1, Math.ceil(cfm / 28000));
    const ductSqFt = cfm / trunks / p.ductVelocity;
    const ductDia = Math.sqrt((ductSqFt * 144 * 4) / Math.PI);

    const filterArea = cfm / p.airToCloth;
    const hp = (cfm * p.staticPressure) / (6356 * 0.65);

    // Higher loading and more shifts shorten the media interval.
    const shiftHours = state.shifts * 8;
    const loadFactor = capture / Math.max(cfm, 1);
    const serviceMonths = Math.max(3, Math.round(26 / (state.shifts * (0.75 + loadFactor))));

    const annualHours = shiftHours * 5 * 50;
    const energy = (hp * 0.746 * annualHours * 0.12) / 1000; // $k per year

    return { cfm, ductDia, trunks, filterArea, hp, serviceMonths, energy, profile: p };
  }

  let lastSpeed = null;

  function render(immediate) {
    const r = compute();

    setMetric(out.cfm, r.cfm, 0, immediate);
    setMetric(out.duct, r.ductDia, 1, immediate);
    setMetric(out.filter, r.filterArea, 0, immediate);
    setMetric(out.power, r.hp, 1, immediate);
    setMetric(out.service, r.serviceMonths, 0, immediate);
    setMetric(out.trunks, r.trunks, 0, immediate);
    setMetric(out.velocity, r.profile.ductVelocity, 0, immediate);
    setMetric(out.energy, r.energy, 1, immediate);

    if (out.media) out.media.textContent = r.profile.media;
    if (out.code) out.code.textContent = r.profile.code;
    if (out.note) out.note.textContent = r.profile.note;

    if (areaOut) areaOut.textContent = `${state.area.toLocaleString('en-US')} sq ft`;
    if (pointsOut) pointsOut.textContent = `${state.points} pickup points`;

    // Flow animation speeds up with volume: 4200 CFM ≈ 2.6s cycle, 60k CFM ≈ 0.6s.
    // Only written when it actually changes — restyling it every frame fights
    // the running animation.
    if (out.stream && !prefersReducedMotion) {
      const speed = Math.max(0.55, 3.2 - r.cfm / 22000).toFixed(2);
      if (speed !== lastSpeed) {
        out.stream.style.animationDuration = `${speed}s`;
        lastSpeed = speed;
      }
    }
  }

  // One render per animation frame, however fast the slider fires.
  let frame = null;
  function scheduleRender() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      render(true);
    });
  }

  function paintRange(input) {
    if (!input) return;
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
    input.style.background =
      `linear-gradient(90deg, #ea580c 0%, #f97316 ${pct}%, var(--color-surface-2) ${pct}%)`;
  }

  root.querySelectorAll('.cfg-option').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile = btn.dataset.profile;
      root.querySelectorAll('.cfg-option').forEach(b => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      render(false);
    });
  });

  root.querySelectorAll('.cfg-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.shifts = parseInt(btn.dataset.shifts, 10);
      root.querySelectorAll('.cfg-toggle button').forEach(b => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      render(false);
    });
  });

  if (areaInput) {
    areaInput.addEventListener('input', () => {
      state.area = parseInt(areaInput.value, 10);
      paintRange(areaInput);
      scheduleRender();
    });
  }

  if (pointsInput) {
    pointsInput.addEventListener('input', () => {
      state.points = parseInt(pointsInput.value, 10);
      paintRange(pointsInput);
      scheduleRender();
    });
  }

  [areaInput, pointsInput].forEach(paintRange);
  render(true);
}

/* ==========================================================================
   Interactive module B — System Anatomy Explorer (home2.html)
   ========================================================================== */
const ANATOMY_STAGES = [
  {
    id: 'capture',
    no: 'Stage 01',
    title: 'Source Capture Hood',
    body: 'Contaminant is pulled at the point of generation, before it ever reaches the operator breathing zone. Hood geometry is modeled per station rather than pulled from a catalogue.',
    specs: [
      ['Capture velocity', '100 – 200 fpm'],
      ['Hood types', 'Slot / canopy / articulated arm'],
      ['Reach', 'Up to 23 ft articulated'],
      ['Positioning', 'Self-supporting, 360° swivel']
    ]
  },
  {
    id: 'duct',
    no: 'Stage 02',
    title: 'Transport Ducting',
    body: 'Spiral duct is sized to hold minimum transport velocity across every branch, so heavy particulate stays airborne instead of settling into the run and building a fuel load.',
    specs: [
      ['Transport velocity', '3,500 – 4,500 fpm'],
      ['Material', '14-ga spiral, welded seams'],
      ['Balancing', 'CFD-modeled per branch'],
      ['Access', 'Cleanout ports at each elbow']
    ]
  },
  {
    id: 'safety',
    no: 'Stage 03',
    title: 'Spark Arrest & Isolation',
    body: 'Infrared detection watches the duct stream. A confirmed spark triggers suppression and slams the abort gate, venting the run before ignition can reach the collector.',
    specs: [
      ['Detection', 'IR, sub-millisecond'],
      ['Abort gate closure', '< 50 ms'],
      ['Isolation', 'Back-draft damper + rotary valve'],
      ['Standard', 'NFPA 69 / NFPA 654']
    ]
  },
  {
    id: 'collector',
    no: 'Stage 04',
    title: 'Cartridge Collector',
    body: 'Pleated media separates particulate from the airstream. Reverse-pulse cleaning fires on differential pressure, not on a timer, so compressed air is spent only when loading calls for it.',
    specs: [
      ['Efficiency', '99.99% @ 0.5 micron'],
      ['Cleaning', 'On-demand reverse pulse jet'],
      ['Air-to-cloth', '2.0 : 1 typical'],
      ['Hopper', 'Rotary airlock discharge']
    ]
  },
  {
    id: 'fan',
    no: 'Stage 05',
    title: 'Fan & Return Air',
    body: 'A VFD-driven backward-inclined fan sits on the clean side. Filtered air is returned to the building in heating season, so conditioned air is not exhausted straight through the roof.',
    specs: [
      ['Drive', 'VFD, pressure-tracking'],
      ['Fan type', 'Backward-inclined, clean-side'],
      ['Return air', 'Up to 95% recirculated'],
      ['Monitoring', 'Downstream particulate sensor']
    ]
  }
];

function initAnatomyExplorer() {
  const root = document.getElementById('systemAnatomy');
  if (!root) return;

  const detail = root.querySelector('#anatomyDetail');
  const stream = root.querySelector('#anatomyStream');
  const loadInput = root.querySelector('#anatomyLoad');
  const loadVal = root.querySelector('#anatomyLoadVal');
  const tel = {
    cfm: root.querySelector('#telCfm'),
    dp: root.querySelector('#telDp'),
    life: root.querySelector('#telLife'),
    power: root.querySelector('#telPower')
  };

  let activeIndex = 0;
  let autoTimer = null;
  let lastStreamSpeed = null;
  let telFrame = null;

  function renderDetail(index) {
    const stage = ANATOMY_STAGES[index];
    if (!stage || !detail) return;

    const specs = stage.specs
      .map(([k, v]) => `<li><span class="sk">${k}</span><span class="sv">${v}</span></li>`)
      .join('');

    detail.classList.add('is-swapping');

    setTimeout(() => {
      detail.innerHTML =
        `<span class="stage-no">${stage.no}</span>` +
        `<h3>${stage.title}</h3>` +
        `<p>${stage.body}</p>` +
        `<ul class="anatomy-specs">${specs}</ul>`;
      detail.classList.remove('is-swapping');
    }, prefersReducedMotion ? 0 : 180);
  }

  function select(index, userDriven) {
    activeIndex = index;

    root.querySelectorAll('.hotspot').forEach((node, i) => {
      node.classList.toggle('is-active', i === index);
      node.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    root.querySelectorAll('.anatomy-step-nav button').forEach((btn, i) => {
      btn.classList.toggle('is-active', i === index);
    });

    renderDetail(index);

    // The tour is an invitation, not a hijack — first interaction ends it.
    if (userDriven && autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function renderTelemetry(load) {
    const cfm = Math.round((8000 + load * 340) / 50) * 50;
    const dp = (1.4 + (load / 100) * 3.1).toFixed(1);
    const life = Math.max(3, Math.round(22 - load * 0.16));
    const power = Math.round(18 + Math.pow(load / 100, 3) * 62);

    if (tel.cfm) tel.cfm.textContent = cfm.toLocaleString('en-US');
    if (tel.dp) tel.dp.textContent = dp;
    if (tel.life) tel.life.textContent = life;
    if (tel.power) tel.power.textContent = power;

    if (loadVal) {
      const mode = load < 30 ? 'Idle' : load < 70 ? 'Nominal' : 'Peak';
      loadVal.textContent = `${load}% · ${mode}`;
    }

    // Written only on change so the dash animation is not restyled mid-cycle.
    if (stream && !prefersReducedMotion) {
      const speed = Math.max(0.5, 3.4 - (load / 100) * 2.9).toFixed(2);
      if (speed !== lastStreamSpeed) {
        stream.style.animationDuration = `${speed}s`;
        lastStreamSpeed = speed;
      }
    }

    if (loadInput) {
      loadInput.style.background =
        `linear-gradient(90deg, #ea580c 0%, #f97316 ${load}%, rgba(255,255,255,0.14) ${load}%)`;
    }
  }

  root.querySelectorAll('.hotspot').forEach((node, i) => {
    node.addEventListener('click', () => select(i, true));
    node.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(i, true);
      }
    });
  });

  root.querySelectorAll('.anatomy-step-nav button').forEach((btn, i) => {
    btn.addEventListener('click', () => select(i, true));
  });

  if (loadInput) {
    loadInput.addEventListener('input', () => {
      // Coalesce to one update per frame however fast the slider fires.
      if (!telFrame) {
        telFrame = requestAnimationFrame(() => {
          telFrame = null;
          renderTelemetry(parseInt(loadInput.value, 10));
        });
      }

      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    });
  }

  select(0, false);
  renderTelemetry(loadInput ? parseInt(loadInput.value, 10) : 65);

  // Walk the stages once the section is on screen so it reads as live.
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const starter = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        autoTimer = setInterval(() => {
          select((activeIndex + 1) % ANATOMY_STAGES.length, false);
        }, 3800);
      });
    }, { threshold: 0.4 });

    starter.observe(root);
  }
}
