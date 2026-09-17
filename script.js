'use strict';

// --- Instant Top-Scroll Guarantee on Page Load & Reload ---
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function resetScrollToTop() {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  root.scrollTop = 0;
  requestAnimationFrame(() => {
    root.style.scrollBehavior = previousBehavior;
  });
}

// Reset scroll to hero immediately
resetScrollToTop();

// Strip anchor fragment on reload so browser doesn't anchor-jump down
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});
window.addEventListener('pagehide', () => {
  window.scrollTo(0, 0);
});
window.addEventListener('pageshow', () => {
  resetScrollToTop();
});

const siteHeader = document.querySelector('.site-header');
const heroSection = document.querySelector('.hero');
function updateHeaderScroll() {
  if (!siteHeader) return;
  const heroHeight = heroSection ? heroSection.offsetHeight : 800;
  const isPastHero = window.scrollY > (heroHeight - 110);
  siteHeader.classList.toggle('is-scrolled', isPastHero);
}
window.addEventListener('scroll', updateHeaderScroll, { passive: true });
updateHeaderScroll();

const menu = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
function closeMenu() {
  if (mobileMenu.open) mobileMenu.close();
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  document.documentElement.classList.remove('menu-is-open');
}
menu.addEventListener('click', () => {
  if (mobileMenu.open) return closeMenu();
  mobileMenu.showModal();
  menu.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-label', 'Close navigation');
  document.documentElement.classList.add('menu-is-open');
});
mobileMenu.querySelector('.mobile-menu-close').addEventListener('click', closeMenu);
mobileMenu.addEventListener('close', closeMenu);
mobileMenu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeMenu();
  const target = document.querySelector(link.getAttribute('href'));
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}));
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

// =======================================================
// VIA SKY LUXURY CONCIERGE MODAL & WHATSAPP INTEGRATION
// =======================================================
const dialog = document.getElementById('concierge-dialog') || document.querySelector('.trip-dialog');
const form = document.getElementById('trip-form') || document.querySelector('.brief-form');
const result = document.querySelector('.brief-result');

// Business WhatsApp number: 08138252839 -> +234 813 825 2839
const VIASKY_WHATSAPP_NUMBER = '2348138252839';

// Set departure date minimum to today
if (form && form.elements.departure) {
  const today = new Date();
  form.elements.departure.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// 1. Reusable Custom Dropdown Component
function initCustomSelect(container) {
  const trigger = container.querySelector('.select-trigger');
  const valueDisplay = container.querySelector('.select-value');
  const dropdown = container.querySelector('.select-dropdown');
  const hiddenInput = container.querySelector('input[type="hidden"]');
  const options = container.querySelectorAll('.select-option');

  if (!trigger || !dropdown) return;

  const close = () => {
    container.classList.remove('is-open');
    container.closest('.form-row-2, .form-row-3, .form-group')?.classList.remove('has-select-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    document.querySelectorAll('.custom-select.is-open').forEach(other => {
      if (other !== container) {
        other.classList.remove('is-open');
        other.closest('.form-row-2, .form-row-3, .form-group')?.classList.remove('has-select-open');
        other.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
      }
    });
    container.classList.add('is-open');
    container.closest('.form-row-2, .form-row-3, .form-group')?.classList.add('has-select-open');
    trigger.setAttribute('aria-expanded', 'true');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (container.classList.contains('is-open')) close();
    else open();
  });

  const select = (option) => {
    const val = option.dataset.value;
    if (hiddenInput) hiddenInput.value = val;
    if (valueDisplay) valueDisplay.textContent = option.textContent.trim();

    options.forEach(opt => {
      opt.classList.remove('is-active');
      opt.setAttribute('aria-selected', 'false');
    });
    option.classList.add('is-active');
    option.setAttribute('aria-selected', 'true');
    close();
    trigger.focus();
  };

  options.forEach(option => {
    option.setAttribute('tabindex', '0');
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      select(option);
    });
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        select(option);
      }
    });
  });
}

document.querySelectorAll('.custom-select').forEach(initCustomSelect);

// Helper to pre-select a service option in custom dropdown
function setCustomSelectValue(containerId, valueMatch) {
  const container = document.getElementById(containerId);
  if (!container || !valueMatch) return;
  const match = valueMatch.toLowerCase();
  const options = container.querySelectorAll('.select-option');
  let targetOption = null;

  options.forEach(opt => {
    const val = (opt.dataset.value || opt.textContent).toLowerCase();
    if (
      val === match ||
      val.includes(match) ||
      (match.includes('visa') && val.includes('visa')) ||
      (match.includes('flight') && val.includes('flight')) ||
      ((match.includes('hotel') || match.includes('stay') || match.includes('accom')) && (val.includes('hotel') || val.includes('stay'))) ||
      ((match.includes('holiday') || match.includes('tour')) && val.includes('holiday'))
    ) {
      if (!targetOption) targetOption = opt;
    }
  });

  if (targetOption) {
    options.forEach(opt => {
      opt.classList.remove('is-active');
      opt.setAttribute('aria-selected', 'false');
    });
    targetOption.classList.add('is-active');
    targetOption.setAttribute('aria-selected', 'true');
    const valSpan = container.querySelector('.select-value');
    const hiddenInput = container.querySelector('input[type="hidden"]');
    if (valSpan) valSpan.textContent = targetOption.textContent.trim();
    if (hiddenInput) hiddenInput.value = targetOption.dataset.value;
  }
}

// Close open dropdowns on outside click or Esc
document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-select')) {
    document.querySelectorAll('.custom-select.is-open').forEach(sel => {
      sel.classList.remove('is-open');
      sel.closest('.form-row-2, .form-row-3, .form-group')?.classList.remove('has-select-open');
      sel.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.custom-select.is-open').forEach(sel => {
      sel.classList.remove('is-open');
      sel.closest('.form-row-2, .form-row-3, .form-group')?.classList.remove('has-select-open');
      sel.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }
});

// 2. Modal Open & Triggers from [data-plan]
document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => {
  closeMenu();
  const requestedService = button.dataset.service;
  if (requestedService) {
    setCustomSelectValue('select-service', requestedService);
  }
  if (result) {
    result.textContent = '';
    result.className = 'brief-result full';
  }
  if (dialog) dialog.showModal();
}));

const dialogCloseBtn = document.querySelector('.dialog-close');
if (dialogCloseBtn) dialogCloseBtn.addEventListener('click', () => dialog?.close());
if (dialog) {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
}

// 4. Form Submission & Executive WhatsApp Payload
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(form);
    const destination = String(values.get('destination') || '').trim();
    if (!destination) {
      form.elements.destination?.setCustomValidity('Please enter your destination or country.');
      form.elements.destination?.reportValidity();
      return;
    }

    const service = values.get('service') || 'Complete Holiday & Stays';
    const origin = String(values.get('origin') || '').trim() || 'Flexible / To be confirmed';
    const departure = values.get('departure') || 'Flexible / To be confirmed';
    const travellers = values.get('travellers') || '2 Travellers';
    const style = values.get('style') || 'Leisure & Holiday';
    const notes = String(values.get('notes') || '').trim();

    let message = `Hello ViaSky Private Travel Desk,\n\n` +
      `I would like to submit a booking request:\n\n` +
      `• Service Required: ${service}\n` +
      `• Departing From: ${origin}\n` +
      `• Destination: ${destination}\n` +
      `• Departure Date: ${departure}\n` +
      `• Travellers: ${travellers}\n` +
      `• Travel Style: ${style}\n`;

    if (notes) {
      message += `• Notes & Preferences: ${notes}\n`;
    }

    message += `\nPlease share curated flight schedules, luxury stays, and itinerary options. Thank you.`;

    const whatsappUrl = `https://wa.me/${VIASKY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    if (result) {
      result.textContent = 'Connecting to ViaSky Concierge on WhatsApp…';
      result.className = 'brief-result full is-active';
    }

    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      dialog?.close();
      if (result) {
        result.textContent = '';
        result.className = 'brief-result full';
      }
    }, 400);
  });

  if (form.elements.destination) {
    form.elements.destination.addEventListener('input', () => form.elements.destination.setCustomValidity(''));
  }
}

// --- World-Class Hero Dynamics: 2.5D Parallax, Atmospheric Particles, & Tactile Physics ---
const hero = document.querySelector('.hero');
const scene = document.querySelector('.scene');
const artwork = document.querySelector('.scene-image');
const canvas = document.querySelector('.lake-light');
const context = canvas.getContext('2d');
const heroContent = document.querySelector('.hero-content');
const primaryButton = document.querySelector('.primary-button');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');

let visible = true;
let frame = 0;
let lastPaint = 0;
let elapsed = 0;
let lastTime = 0;
let width = 0, height = 0, pixelRatio = 1;
let sourceScale = 1, sourceX = 0, sourceY = 0;

// Parallax coordinates & lerp damping
let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
let heroTargetX = 0, heroTargetY = 0, heroCurrentX = 0, heroCurrentY = 0;
let heroTargetRotX = 0, heroTargetRotY = 0, heroCurrentRotX = 0, heroCurrentRotY = 0;

// Magnetic button physics
let magTargetX = 0, magTargetY = 0, magCurrentX = 0, magCurrentY = 0;
let isButtonHovered = false;

// Lake reflections
const desktopLake = [[220,516],[440,514],[640,533],[883,563],[981,600],[897,625],[802,668],[710,713],[610,738],[493,709],[415,676],[294,619],[222,571]];
const mobileLake = [[.14,.66],[.29,.66],[.44,.675],[.58,.69],[.58,.74],[.46,.76],[.31,.79],[.2,.77],[.16,.72]].map(([x,y]) => [x * 1672, y * 1672 * 16 / 9]);
let lake = desktopLake;

function insideLake(x, y) {
  let inside = false;
  for (let i = 0, j = lake.length - 1; i < lake.length; j = i++) {
    const [ax, ay] = lake[i], [bx, by] = lake[j];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

let seed = 27;
function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

const reflections = [];
function placeReflections() {
  seed = 27;
  reflections.length = 0;
  const xs = lake.map(point => point[0]), ys = lake.map(point => point[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX, spanY = Math.max(...ys) - minY;
  for (let i = 0; i < 400 && reflections.length < 66; i++) {
    const x = minX + random() * spanX, y = minY + random() * spanY;
    if (insideLake(x, y)) reflections.push({ x, y, width: 3 + random() * 12, phase: random() * Math.PI * 2, speed: .55 + random() * .6 });
  }
}

// Atmospheric sun motes drifting through alpine mountain air
const motes = [];
function initMotes() {
  motes.length = 0;
  const count = 36;
  for (let i = 0; i < count; i++) {
    motes.push({
      x: random() * (width || 1200),
      y: random() * (height ? height * 0.75 : 600),
      radius: 0.8 + random() * 1.8,
      baseAlpha: 0.15 + random() * 0.45,
      speedX: (random() - 0.5) * 0.25,
      speedY: -0.15 - random() * 0.22,
      phase: random() * Math.PI * 2,
      pulseSpeed: 0.8 + random() * 1.2
    });
  }
}

function fitScene() {
  width = hero.clientWidth;
  height = hero.clientHeight;
  pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);

  const imageWidth = artwork.naturalWidth || 1672, imageHeight = artwork.naturalHeight || 941;
  lake = imageHeight > imageWidth ? mobileLake : desktopLake;
  placeReflections();
  initMotes();

  const position = getComputedStyle(artwork).objectPosition.split(' ').map(parseFloat);
  const scale = Math.max(width / imageWidth, height / imageHeight);
  sourceScale = scale * imageWidth / 1672;
  sourceX = (width - imageWidth * scale) * (position[0] / 100);
  sourceY = (height - imageHeight * scale) * (position[1] / 100);
  requestFrame();
}

function allowedMotion() {
  return !reducedMotion.matches && visible && !document.hidden && !dialog.open;
}

function requestFrame() {
  if (!frame && allowedMotion()) frame = requestAnimationFrame(paint);
}

function paint(now) {
  frame = 0;
  if (!allowedMotion()) { lastTime = 0; return; }
  const delta = lastTime ? Math.min(now - lastTime, 60) : 0;
  elapsed += delta;
  lastTime = now;
  const time = elapsed / 1000;

  // Ambient breathing motion when idle or on mobile
  let idleX = 0, idleY = 0;
  if (!finePointer.matches) {
    idleX = Math.sin(time * 0.7) * 4;
    idleY = Math.cos(time * 0.5) * 3;
  }

  // Multi-plane optical scroll parallax
  const scrollY = window.scrollY;
  const heroHeight = hero.clientHeight || window.innerHeight || 880;
  const scrollRatio = Math.min(1.2, Math.max(0, scrollY / heroHeight));

  // Background scene dynamics (pointer lerp + subtle idle motion)
  currentX += ((targetX + idleX) - currentX) * 0.08;
  currentY += ((targetY + idleY) - currentY) * 0.08;

  // Background parallax: moves slower than scroll to create vast distance
  const bgScrollOffset = scrollY * 0.28;
  const bgScale = 1.025 + Math.min(scrollRatio, 1.0) * 0.04;
  scene.style.setProperty('--scene-tx', `${currentX.toFixed(2)}px`);
  scene.style.setProperty('--scene-ty', `${(currentY + bgScrollOffset).toFixed(2)}px`);
  scene.style.setProperty('--scene-scale', bgScale.toFixed(4));

  // Foreground hero content parallax & bidirectional re-entry
  if (heroContent) {
    heroCurrentX += (heroTargetX - heroCurrentX) * 0.08;
    heroCurrentY += (heroTargetY - heroCurrentY) * 0.08;
    heroCurrentRotX += (heroTargetRotX - heroCurrentRotX) * 0.07;
    heroCurrentRotY += (heroTargetRotY - heroCurrentRotY) * 0.07;

    // Foreground floats upward faster than scroll (-0.22x rate)
    const fgScrollY = scrollY * -0.22;
    // Fade out as scroll reaches transition into About; restores on scroll-up (re-entry)
    const fadeDistance = heroHeight * 0.65;
    const heroProgress = Math.min(1, Math.max(0, scrollY / fadeDistance));
    const heroOpacity = Math.max(0, 1 - heroProgress * 1.05);
    const heroBlur = heroProgress * 5;
    const heroScale = 1 - heroProgress * 0.06;

    heroContent.style.setProperty('--hero-tx', `${heroCurrentX.toFixed(2)}px`);
    heroContent.style.setProperty('--hero-ty', `${heroCurrentY.toFixed(2)}px`);
    heroContent.style.setProperty('--hero-rx', `${heroCurrentRotX.toFixed(2)}deg`);
    heroContent.style.setProperty('--hero-ry', `${heroCurrentRotY.toFixed(2)}deg`);
    heroContent.style.setProperty('--hero-scroll-y', `${fgScrollY.toFixed(2)}px`);
    heroContent.style.setProperty('--hero-opacity', heroOpacity.toFixed(3));
    heroContent.style.setProperty('--hero-blur', `${heroBlur.toFixed(2)}px`);
    heroContent.style.setProperty('--hero-scale', heroScale.toFixed(4));
  }

  // Magnetic button spring physics
  if (primaryButton && finePointer.matches) {
    magCurrentX += (magTargetX - magCurrentX) * 0.12;
    magCurrentY += (magTargetY - magCurrentY) * 0.12;
    if (Math.abs(magCurrentX) > 0.1 || Math.abs(magCurrentY) > 0.1) {
      primaryButton.style.transform = `translate3d(${magCurrentX.toFixed(2)}px, ${magCurrentY.toFixed(2)}px, 0)`;
    } else if (!isButtonHovered) {
      primaryButton.style.transform = '';
    }
  }

  // Canvas rendering: Lake sparkles + Atmospheric Sun Motes
  if (context && now - lastPaint >= 33) {
    lastPaint = now;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    // 1. Lake reflections
    context.save();
    context.translate(sourceX, sourceY);
    context.scale(sourceScale, sourceScale);
    context.beginPath();
    lake.forEach(([x,y], index) => index ? context.lineTo(x,y) : context.moveTo(x,y));
    context.closePath();
    context.clip();
    context.lineCap = 'round';

    for (const shine of reflections) {
      const beat = Math.max(0, Math.sin(time * shine.speed + shine.phase));
      const alpha = Math.pow(beat, 5) * 0.56;
      if (alpha < 0.025) continue;
      const drift = Math.sin(time * 0.45 + shine.phase) * 2.2;
      const length = shine.width * (0.55 + beat * 0.45);
      context.strokeStyle = `rgba(255,247,208,${alpha})`;
      context.lineWidth = 0.7 + beat * 0.4;
      context.beginPath();
      context.moveTo(shine.x + drift - length / 2, shine.y);
      context.quadraticCurveTo(shine.x + drift, shine.y - 0.45, shine.x + drift + length / 2, shine.y);
      context.stroke();
    }
    context.restore();

    // 2. Atmospheric Sun Motes (Golden Alpine Air)
    for (const mote of motes) {
      mote.x += mote.speedX + (currentX * -0.015);
      mote.y += mote.speedY;
      if (mote.y < -10) {
        mote.y = height * 0.75;
        mote.x = random() * width;
      }
      if (mote.x < -10) mote.x = width + 10;
      if (mote.x > width + 10) mote.x = -10;

      const pulse = 0.5 + 0.5 * Math.sin(time * mote.pulseSpeed + mote.phase);
      const alpha = mote.baseAlpha * pulse;
      if (alpha < 0.04) continue;

      context.beginPath();
      context.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 238, 178, ${alpha})`;
      context.shadowColor = 'rgba(231, 170, 37, 0.6)';
      context.shadowBlur = 6;
      context.fill();
    }
    context.shadowBlur = 0;
  }

  requestFrame();
}

function stopFrame() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  lastTime = 0;
}

function updateMotion() {
  document.body.classList.toggle('motion-paused', reducedMotion.matches);
  if (allowedMotion()) {
    requestFrame();
  } else {
    stopFrame();
    scene.style.removeProperty('--scene-tx');
    scene.style.removeProperty('--scene-ty');
    scene.style.removeProperty('--scene-scale');
    if (heroContent) {
      heroContent.style.removeProperty('--hero-tx');
      heroContent.style.removeProperty('--hero-ty');
      heroContent.style.removeProperty('--hero-rx');
      heroContent.style.removeProperty('--hero-ry');
      heroContent.style.removeProperty('--hero-scroll-y');
      heroContent.style.removeProperty('--hero-opacity');
      heroContent.style.removeProperty('--hero-blur');
      heroContent.style.removeProperty('--hero-scale');
    }
    if (primaryButton) primaryButton.style.transform = '';
    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Interactive pointer dynamics (Parallax, Tilt, Spotlight Aura)
hero.addEventListener('pointermove', event => {
  if (!finePointer.matches || !allowedMotion()) return;
  const rect = hero.getBoundingClientRect();
  const relX = (event.clientX - rect.left) / rect.width;
  const relY = (event.clientY - rect.top) / rect.height;

  // Background scene displacement (slight negative depth)
  targetX = (relX - 0.5) * -14;
  targetY = (relY - 0.5) * -9;

  // Foreground text displacement & 3D tilt (positive forward depth)
  heroTargetX = (relX - 0.5) * 16;
  heroTargetY = (relY - 0.5) * 11;
  heroTargetRotX = (relY - 0.5) * -4.5;
  heroTargetRotY = (relX - 0.5) * 5.5;

  // Update ambient glow position
  hero.style.setProperty('--glow-x', `${(relX * 100).toFixed(1)}%`);
  hero.style.setProperty('--glow-y', `${(relY * 100).toFixed(1)}%`);

  requestFrame();
}, { passive: true });

hero.addEventListener('pointerleave', () => {
  targetX = 0;
  targetY = 0;
  heroTargetX = 0;
  heroTargetY = 0;
  heroTargetRotX = 0;
  heroTargetRotY = 0;
  magTargetX = 0;
  magTargetY = 0;
  isButtonHovered = false;
  hero.style.setProperty('--glow-x', '50%');
  hero.style.setProperty('--glow-y', '40%');
});

// Primary CTA magnetic attraction
if (primaryButton) {
  primaryButton.addEventListener('pointerenter', () => { isButtonHovered = true; });
  primaryButton.addEventListener('pointermove', event => {
    if (!finePointer.matches || !allowedMotion()) return;
    const rect = primaryButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = event.clientX - centerX;
    const distY = event.clientY - centerY;
    magTargetX = distX * 0.28;
    magTargetY = distY * 0.28;
    requestFrame();
  });
  primaryButton.addEventListener('pointerleave', () => {
    isButtonHovered = false;
    magTargetX = 0;
    magTargetY = 0;
    requestFrame();
  });
}

new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  if (visible) requestFrame(); else stopFrame();
}).observe(hero);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopFrame(); else requestFrame();
});

dialog.addEventListener('close', requestFrame);
reducedMotion.addEventListener('change', updateMotion);
window.addEventListener('resize', fitScene);

// --- Preloader Controller & Lifecycle Transition ---
const preloader = document.getElementById('preloader');
const preloaderMsg = document.getElementById('preloader-msg');
const preloaderProgress = document.getElementById('preloader-progress');
const preloaderJet = document.getElementById('preloader-jet');
const preloaderPct = document.getElementById('preloader-pct');
const preloaderSub = document.getElementById('preloader-sub');

let preloaderFinished = false;

function initPreloader() {
  if (!preloader || reducedMotion.matches) {
    if (preloader) preloader.style.display = 'none';
    startScene();
    return;
  }

  let progress = 0;
  const startTime = performance.now();
  const minDuration = 1900; // minimum duration to appreciate the flight sequence
  const maxDuration = 3200; // safety ceiling: prevents slow mobile connections from getting stuck

  function updatePreloader(time) {
    const elapsed = time - startTime;
    const isAssetReady = (artwork && artwork.complete && artwork.naturalWidth) || elapsed >= maxDuration;

    // Calculate simulated progress towards 100%
    const targetProgress = (isAssetReady && elapsed >= minDuration) || elapsed >= maxDuration ? 100 : Math.min(94, (elapsed / minDuration) * 94);
    progress += (targetProgress - progress) * 0.14;

    if (progress >= 99.2 && ((isAssetReady && elapsed >= minDuration) || elapsed >= maxDuration)) {
      progress = 100;
    }

    if (preloaderProgress) preloaderProgress.style.width = `${progress.toFixed(1)}%`;
    if (preloaderJet) preloaderJet.style.left = `${progress.toFixed(1)}%`;
    if (preloaderPct) preloaderPct.textContent = `${Math.round(progress)}%`;

    // Adaptive aeronautical status messages
    if (preloaderMsg && preloaderSub) {
      if (progress < 40) {
        preloaderMsg.textContent = 'Preparing your departure...';
        preloaderSub.textContent = 'Personal travel brief & flights';
      } else if (progress < 80) {
        preloaderMsg.textContent = 'Charting your journey...';
        preloaderSub.textContent = 'From Nigeria. To everywhere.';
      } else {
        preloaderMsg.textContent = 'Ready for departure';
        preloaderSub.textContent = 'Your next trip, without the stress.';
      }
    }

    if (progress >= 100 && !preloaderFinished) {
      preloaderFinished = true;
      dismissPreloader();
      return;
    }

    requestAnimationFrame(updatePreloader);
  }

  requestAnimationFrame(updatePreloader);
}

function dismissPreloader() {
  resetScrollToTop();
  // 1. Airplane accelerates forward into the sky
  preloader.classList.add('preloader-departing');

  // 2. Start hero scene and canvas right as the airplane ascends
  setTimeout(() => {
    startScene();
  }, 400);

  // 3. Dissolve the preloader curtain overlay
  setTimeout(() => {
    preloader.classList.add('preloader-done');
  }, 650);

  // 4. Remove preloader from DOM flow after fade
  setTimeout(() => {
    preloader.style.display = 'none';
  }, 1550);
}

// --- Editorial Statement Section: Word Illumination & Pinned 3D Destination Deck ---
const statementPinSection = document.getElementById('about');
const statementText = document.getElementById('statement-text');
const statementDeck = document.getElementById('statement-deck');
let statementWords = [];
let statementDeckCards = [];
let currentDeckIndex = 0;

function initStatementSection() {
  if (!statementText || statementWords.length > 0) return;

  // Check if .scroll-word and .inline-pill elements already exist in HTML
  const existingElements = statementText.querySelectorAll('.scroll-word, .inline-pill, .punct');
  if (existingElements.length > 0) {
    statementWords = Array.from(existingElements);

    // Wire up interactive clicks on the inline pills to open planner
    statementText.querySelectorAll('.inline-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const pillType = pill.getAttribute('data-pill');
        if (form && form.elements.destination) {
          if (pillType === 'flight') form.elements.destination.value = 'London, UK (First Class)';
          else if (pillType === 'stay') form.elements.destination.value = 'Zanzibar, Tanzania (Private Villa)';
          else if (pillType === 'visa') form.elements.destination.value = 'Priority Visa Protocol';
          else form.elements.destination.value = 'Lagos / Abuja Bespoke Departure';
        }
        form.elements.style.value = selectedStyle;
        result.textContent = '';
        dialog.showModal();
      });
    });

    updateStatementScroll();
    return;
  }

  const text = statementText.textContent.trim();
  const words = text.split(/\s+/);
  statementText.textContent = '';

  const goldWords = ['extraordinary', 'first-class', 'luxury', 'dedicated', 'hassle-free'];

  statementWords = words.map(word => {
    const span = document.createElement('span');
    span.className = 'scroll-word';
    span.textContent = word + ' ';
    const cleanWord = word.toLowerCase().replace(/[^a-z-]/g, '');
    if (goldWords.includes(cleanWord)) {
      span.dataset.gold = 'true';
    }
    statementText.appendChild(span);
    return span;
  });

  updateStatementScroll();
}

function setStatementCard(index) {
  if (!statementDeckCards.length) return;
  const count = statementDeckCards.length;
  currentDeckIndex = ((index % count) + count) % count;

  statementDeckCards.forEach((card, i) => {
    card.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');

    let offset = i - currentDeckIndex;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;

    if (offset === 0) {
      card.classList.add('active');
    } else if (offset === -1) {
      card.classList.add('prev');
    } else if (offset === 1) {
      card.classList.add('next');
    } else if (offset < -1) {
      card.classList.add('hidden-left');
    } else {
      card.classList.add('hidden-right');
    }
  });
}

function scrollToCard(index) {
  if (!statementPinSection) return;
  const containerHeight = statementPinSection.offsetHeight;
  const windowHeight = window.innerHeight;
  const maxScroll = containerHeight - windowHeight;
  if (maxScroll <= 0) return;

  const count = statementDeckCards.length || 4;
  const clampedIndex = Math.max(0, Math.min(count - 1, index));
  const targetProgress = count > 1 ? clampedIndex / (count - 1) : 0;
  const deckStart = maxScroll * 0.40;
  const deckTravel = maxScroll * 0.58;
  const targetScrollY = statementPinSection.offsetTop + deckStart + (targetProgress * deckTravel);

  window.scrollTo({
    top: targetScrollY,
    behavior: 'smooth'
  });
}

function updateStatementScroll() {
  if (!statementPinSection || reducedMotion.matches) return;

  const rect = statementPinSection.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const containerHeight = statementPinSection.offsetHeight;
  const maxScroll = containerHeight - windowHeight;
  const pinnedScrolled = -rect.top;

  const entryProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));

  // 1. "About ViaSky" badge entrance & re-entry
  const badgeWrap = document.querySelector('.statement-badge-wrap');
  if (badgeWrap) {
    if (entryProgress >= 0.35) {
      badgeWrap.classList.add('badge-entered');
    } else if (entryProgress < 0.15) {
      badgeWrap.classList.remove('badge-entered');
    }
  }

  // 2. Statement word illumination & de-illumination: paced deliberately while fully in section
  if (statementWords.length > 0) {
    const textStart = -windowHeight * 0.08;
    const textEnd = maxScroll * 0.40;
    const wordProgress = Math.max(0, Math.min(1, (pinnedScrolled - textStart) / (textEnd - textStart)));
    const activeCount = Math.floor(wordProgress * (statementWords.length + 1));

    statementWords.forEach((span, index) => {
      if (index < activeCount) {
        span.classList.add(span.dataset.gold === 'true' ? 'active-gold' : 'active');
      } else {
        span.classList.remove('active', 'active-gold');
      }
    });
  }

  // 3. Choreographed entrance & re-entry for the 3D destination card deck as text completes
  if (statementDeck) {
    if (pinnedScrolled >= maxScroll * 0.32) {
      statementDeck.classList.add('deck-ready');
    } else if (pinnedScrolled < maxScroll * 0.22) {
      statementDeck.classList.remove('deck-ready');
    }
  }

  // 4. 3D Card Switching while stage is pinned (deck phase)
  if (statementDeckCards.length > 0 && maxScroll > 0) {
    const deckTravel = maxScroll * 0.60;
    const deckScrolled = Math.max(0, pinnedScrolled - maxScroll * 0.40);
    const progress = Math.max(0, Math.min(0.999, deckScrolled / deckTravel));
    const cardCount = statementDeckCards.length;
    const targetIndex = Math.min(cardCount - 1, Math.floor(progress * cardCount));

    if (targetIndex !== currentDeckIndex) {
      setStatementCard(targetIndex);
    }
  }

  // Keep RAF loop alive
  requestFrame();
}

window.addEventListener('scroll', () => {
  updateStatementScroll();
  requestFrame();
}, { passive: true });

function initStatementDeck() {
  const deck = document.getElementById('statement-deck');
  if (!deck) return;

  statementDeckCards = Array.from(deck.querySelectorAll('.statement-card'));
  if (!statementDeckCards.length) return;

  setStatementCard(0);

  // Click on flanking cards to smoothly scroll & bring them to center
  statementDeckCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      if (index !== currentDeckIndex) {
        scrollToCard(index);
      }
    });
  });


  // Touch swipe support on mobile devices
  let touchStartX = 0;
  let touchStartY = 0;
  deck.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  deck.addEventListener('touchend', e => {
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > 28 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        scrollToCard(Math.min(statementDeckCards.length - 1, currentDeckIndex + 1));
      } else {
        scrollToCard(Math.max(0, currentDeckIndex - 1));
      }
    }
  }, { passive: true });
}

function startScene() {
  resetScrollToTop();
  fitScene();
  initStatementSection();
  initStatementDeck();
  if (!reducedMotion.matches) document.body.classList.add('motion-ready');
  updateMotion();
}

// Start preloader on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    resetScrollToTop();
    initPreloader();
    initStatementSection();
    initStatementDeck();
  });
} else {
  resetScrollToTop();
  initPreloader();
  initStatementSection();
  initStatementDeck();
}





// A scroll-driven photographic accordion, with explicit controls for every scene.
(() => {
  const section = document.querySelector('.service-cinema');
  if (!section) return;
  const stage = section.querySelector('.cinema-stage');
  const panels = [...section.querySelectorAll('.cinema-panel')];
  const about = document.querySelector('#about');
  const aboutStage = document.querySelector('.statement-sticky-stage');
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, frame = 0, manualY = null;
  const clamp = n => Math.max(0, Math.min(1, n));
  function select(index, manual = false) {
    index = Math.max(0, Math.min(panels.length - 1, index));
    if (manual) manualY = window.scrollY;
    active = index;
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === index);
      panel.querySelector('.cinema-selector').setAttribute('aria-expanded', String(i === index));
      panel.querySelector('.cinema-detail').inert = i !== index;
    });
  }
  panels.forEach((panel, i) => panel.querySelector('.cinema-selector').addEventListener('click', () => select(i, true)));
  function draw() {
    frame = 0;
    const rect = section.getBoundingClientRect();
    const height = window.innerHeight;
    if (about && aboutStage) {
      const retreat = clamp((height - about.getBoundingClientRect().bottom) / height);
      aboutStage.style.translate = quiet.matches ? '' : `0 ${-retreat * 80}px`;
    }
    if (rect.top > height || rect.bottom < 0) return;
    const travel = section.offsetHeight - stage.offsetHeight;
    const progress = travel > 0 ? clamp(-rect.top / travel) : 0;
    if (manualY !== null && Math.abs(window.scrollY - manualY) > 65) manualY = null;
    // Keep the service open while a visitor reads or operates its controls.
    const interacting = section.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    if (!quiet.matches && travel > 0 && manualY === null && !interacting) {
      const index = Math.min(3, Math.floor(progress * 4));
      if (active !== index) select(index);
    }
    const entrance = clamp((height - rect.top) / (height * .9));
    panels.forEach((panel, i) => {
      const unfolding = quiet.matches ? 1 : clamp((entrance - i * .045) / .84);
      panel.style.setProperty('--panel-lift', `${(1 - unfolding) * (90 + i * 32)}px`);
      panel.style.setProperty('--panel-tilt', `${(1 - unfolding) * (i - 1.5) * 3}deg`);
      panel.style.setProperty('--image-drift', quiet.matches ? '0%' : `${-progress * 6 + i * .5}%`);
      panel.style.setProperty('--chapter-progress', manualY !== null || quiet.matches || travel <= 0 ? 1 : Math.max(.04, clamp(progress * 4 - i)));
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  quiet.addEventListener('change', schedule);
  select(0);
  schedule();
})();

// Booking is readable without JavaScript; scrolling adds a subtle arrival only.
(() => {
  const year = document.querySelector('#footer-year');
  if (year) year.textContent = new Date().getFullYear();
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || quiet.matches) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: .2 });
  document.querySelectorAll('.booking-line, .booking-intro, .stories-heading, .cinema-heading, .faq-editorial-heading, .invitation-copy, .trusted-featured-card').forEach(element => observer.observe(element));
})();

// --- Trusted Clients (Reviews) Controller ---
(() => {
  // Pure CSS marquee and layout handles transitions smoothly.
})();

// Keep one FAQ answer open at a time.
(() => {
  const rows = [...document.querySelectorAll('.faq-row')];
  rows.forEach(row => row.addEventListener('toggle', () => {
    if (!row.open) return;
    rows.forEach(other => { if (other !== row) other.open = false; });
  }));
})();
