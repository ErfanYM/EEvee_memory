// Photo lightbox (DESIGN-SYSTEM section 8). Native <dialog>, WAAPI FLIP, pointer-event swipe, history-backed close.
import { pauseAllVideos } from './video.js';

const EASE_SHEET = 'cubic-bezier(.32, .72, 0, 1)';
const EASE_OUT = 'cubic-bezier(.23, 1, .32, 1)';
const AXIS_LOCK = 8;
const COMMIT_FRAC = 0.22;
const COMMIT_VEL = 0.11; // px/ms
const MIN_COMMIT_PX = 24;
const DISMISS_PX = 110;
const FRICTION = 0.35;

// Pull the 960w and largest URLs per format out of a polaroid's <picture>, so no JSON fetch is needed.
function parseSrcset(srcset) {
  return srcset.split(',').map((s) => s.trim().split(/\s+/)).filter((p) => p[0]).map(([url, w]) => ({ url, w: parseInt(w, 10) || 0 }));
}
function sourcesFor(fig) {
  const pic = fig.querySelector('picture');
  const out = { sources: [], jpg: null };
  for (const s of pic.querySelectorAll('source')) {
    out.sources.push({ type: s.getAttribute('type'), list: parseSrcset(s.getAttribute('srcset')) });
  }
  out.jpg = parseSrcset(pic.querySelector('img').getAttribute('srcset'));
  return out;
}
function pick(list, want) {
  if (want === 'hi') return list[list.length - 1].url;
  return (list.find((e) => e.w === 960) || list[list.length - 1]).url;
}
// Apply one quality ('lo' = 960w, 'hi' = largest) to a <picture> element.
function applySrc(pic, data, q) {
  const img = pic.querySelector('img');
  pic.querySelectorAll('source').forEach((el) => {
    const m = data.sources.find((s) => s.type === el.getAttribute('type'));
    if (m) el.setAttribute('srcset', pick(m.list, q));
  });
  img.src = pick(data.jpg, q);
  return img;
}

export function initLightbox(root = document) {
  const dlg = root.querySelector('dialog.lightbox');
  if (!dlg) return;
  const figs = [...root.querySelectorAll('.polaroid[data-kind="photo"]')];
  if (!figs.length) return;
  const html = root.documentElement;
  const stage = dlg.querySelector('.lightbox__stage');
  const pic = stage.querySelector('picture');
  const img = stage.querySelector('img');
  const scrim = dlg.querySelector('.lightbox__scrim');
  const closeBtn = dlg.querySelector('.lightbox__close');
  const prevBtn = dlg.querySelector('.lightbox__prev');
  const nextBtn = dlg.querySelector('.lightbox__next');
  const live = dlg.querySelector('.lightbox__live');
  const total = figs.length;
  const data = figs.map(sourcesFor);
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  let idx = 0;
  let isOpen = false;
  let closing = false;
  let busy = false; // open animation / slide transition in flight
  let instantClose = false;
  let anims = [];
  let token = 0; // invalidates stale async work

  // Clear any history entry left over from a reload while the lightbox was open.
  if (history.state && history.state.lb) history.replaceState(null, '');

  const idOf = (i) => figs[i].dataset.mediaId;
  const altOf = (i) => figs[i].querySelector('img').getAttribute('alt') || '';

  function track(a) { anims.push(a); return a; }
  function cancelAnims() { for (const a of anims) { try { a.cancel(); } catch { /* gone */ } } anims = []; }
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const decode = (el) => Promise.race([
    el.decode ? el.decode().catch(() => {}) : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1200)),
  ]);

  // Fit the img box to the photo's aspect ratio inside the stage's padded content box, so 960w and 1600w occupy the same box.
  function fit(i = idx) {
    const [aw, ah] = (figs[i].style.getPropertyValue('--ar') || '1/1').split('/').map(Number);
    const cs = getComputedStyle(stage);
    const w = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const s = Math.min(w / aw, h / ah);
    img.style.width = `${Math.round(aw * s)}px`;
    img.style.height = `${Math.round(ah * s)}px`;
  }

  function setOrigin(i) {
    figs.forEach((f, n) => f.classList.toggle('is-lb-origin', n === i));
  }

  function updateChrome() {
    dlg.dataset.id = idOf(idx);
    dlg.setAttribute('aria-label', altOf(idx));
    img.alt = altOf(idx);
    live.textContent = `${idx + 1} of ${total}`;
    prevBtn.setAttribute('aria-disabled', String(idx === 0));
    nextBtn.setAttribute('aria-disabled', String(idx === total - 1));
  }

  function preloadNeighbours() {
    for (const n of [idx - 1, idx + 1]) {
      if (n < 0 || n >= total) continue;
      const p = document.createElement('picture');
      p.append(...data[n].sources.map((s) => { const e = document.createElement('source'); e.setAttribute('type', s.type); return e; }), document.createElement('img'));
      const el = applySrc(p, data[n], 'lo');
      el.decode?.().catch(() => {});
    }
  }

  // Show photo i: 960w first, 1600w once decoded.
  async function render(i) {
    const my = ++token;
    idx = i;
    updateChrome();
    setOrigin(i);
    fit(i);
    applySrc(pic, data[i], 'lo');
    await decode(img);
    if (my !== token) return;
    preloadNeighbours();
    const hiPic = document.createElement('picture');
    hiPic.append(...data[i].sources.map((s) => { const e = document.createElement('source'); e.setAttribute('type', s.type); return e; }), document.createElement('img'));
    const hi = applySrc(hiPic, data[i], 'hi');
    await decode(hi);
    if (my !== token) return;
    if (hi.currentSrc && hi.currentSrc !== img.currentSrc) applySrc(pic, data[i], 'hi');
  }

  function rectOf(el) { return el.getBoundingClientRect(); }

  // Transform that places the lightbox img over the print's image (position, size, tilt).
  function originTransform(i) {
    const o = figs[i].querySelector('.polaroid__open img');
    const r = rectOf(o);
    const t = rectOf(img);
    const tilt = parseFloat(getComputedStyle(figs[i]).getPropertyValue('--tilt')) || 0;
    const ow = o.offsetWidth || r.width;
    const oh = o.offsetHeight || r.height;
    const dx = r.left + r.width / 2 - (t.left + t.width / 2);
    const dy = r.top + r.height / 2 - (t.top + t.height / 2);
    return {
      transform: `translate(${dx}px, ${dy}px) rotate(${tilt}deg) scale(${ow / t.width}, ${oh / t.height})`,
      onScreen: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
    };
  }

  async function open(i) {
    if (isOpen) return;
    isOpen = true; closing = false; busy = true;
    pauseAllVideos();
    instantClose = false;
    try { history.pushState({ lb: figs[i].dataset.mediaId }, ''); } catch { /* sandboxed */ }
    html.classList.add('lb-open');
    scrim.style.opacity = '0';
    img.style.visibility = 'hidden';
    dlg.showModal();
    closeBtn.focus({ preventScroll: true });
    idx = i;
    updateChrome();
    fit(i);
    const my = ++token;
    applySrc(pic, data[i], 'lo');
    await decode(img);
    if (my !== token || !isOpen) return;
    fit(i);
    setOrigin(i);
    img.style.visibility = '';
    if (reduce()) {
      track(scrim.animate({ opacity: [0, 1] }, { duration: 120, easing: 'linear' })).onfinish = () => { scrim.style.opacity = ''; };
      track(img.animate({ opacity: [0, 1] }, { duration: 120, easing: 'linear' }));
    } else {
      const { transform } = originTransform(i);
      track(img.animate({ transform: [transform, 'none'] }, { duration: 280, easing: EASE_SHEET }));
      track(scrim.animate({ opacity: [0, 1] }, { duration: 220, easing: EASE_OUT })).onfinish = () => { scrim.style.opacity = ''; };
    }
    scrim.style.opacity = '';
    busy = false;
    render(i);
  }

  function finishClose() {
    cancelAnims();
    token++;
    dlg.close();
    html.classList.remove('lb-open');
    img.style.transform = '';
    img.style.opacity = '';
    scrim.style.opacity = '';
    isOpen = false; closing = false; busy = false;
    const fig = figs[idx];
    fig.classList.remove('is-lb-origin');
    const btn = fig.querySelector('.polaroid__open');
    const r = btn.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) btn.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    btn.focus({ preventScroll: true });
  }

  function close(animate) {
    if (!isOpen || closing) return;
    closing = true;
    token++;
    const startScrim = parseFloat(scrim.style.opacity);
    cancelAnims();
    if (!animate) { finishClose(); return; }
    const done = () => finishClose();
    if (reduce()) {
      const a = track(dlg.animate({ opacity: [1, 0] }, { duration: 120, easing: 'linear' }));
      a.onfinish = () => { done(); };
      return;
    }
    const { transform, onScreen } = originTransform(idx);
    if (onScreen) {
      const a = track(img.animate({ transform: [getComputedStyle(img).transform, transform] }, { duration: 220, easing: EASE_SHEET, fill: 'forwards' }));
      track(scrim.animate({ opacity: [Number.isNaN(startScrim) ? 1 : startScrim, 0] }, { duration: 220, easing: EASE_OUT, fill: 'forwards' }));
      a.onfinish = done;
    } else {
      const a = track(dlg.animate({ opacity: [1, 0] }, { duration: 160, easing: 'linear', fill: 'forwards' }));
      a.onfinish = done;
    }
  }

  // X / Esc / backdrop ask history to go back; popstate performs the close.
  function requestClose(animate) {
    if (!isOpen || closing) return;
    if (history.state && history.state.lb) {
      instantClose = !animate;
      history.back();
    } else {
      close(animate);
    }
  }

  window.addEventListener('popstate', () => {
    if (isOpen) { const a = !instantClose; instantClose = false; close(a); }
  });

  // Keyboard-style change: instant, never animated.
  function go(delta) {
    const n = idx + delta;
    if (n < 0 || n >= total || closing) return;
    cancelAnims();
    img.style.transform = '';
    busy = false;
    render(n);
    try { history.replaceState({ lb: idOf(n) }, ''); } catch { /* sandboxed */ }
  }

  for (const f of figs) {
    f.querySelector('.polaroid__open').addEventListener('click', () => open(figs.indexOf(f)));
  }
  closeBtn.addEventListener('click', () => requestClose(true));
  prevBtn.addEventListener('click', () => { if (prevBtn.getAttribute('aria-disabled') !== 'true') go(-1); });
  nextBtn.addEventListener('click', () => { if (nextBtn.getAttribute('aria-disabled') !== 'true') go(1); });

  dlg.addEventListener('cancel', (e) => { e.preventDefault(); requestClose(false); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); requestClose(false); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Tab') {
      const items = [closeBtn, prevBtn, nextBtn];
      const at = items.indexOf(root.activeElement);
      const n = (at + (e.shiftKey ? -1 : 1) + items.length) % items.length;
      e.preventDefault();
      items[at === -1 ? 0 : n].focus();
    }
  });

  let swallowClick = false;
  stage.addEventListener('click', (e) => {
    if (swallowClick) { swallowClick = false; return; }
    if (e.target !== img) requestClose(true);
  });

  window.addEventListener('resize', () => { if (isOpen) fit(); });

  // ---- swipe ----
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    if (drag || busy || closing || e.pointerType === 'mouse' || !e.isPrimary) return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, axis: null, dx: 0, dy: 0, samples: [{ t: performance.now(), x: e.clientX, y: e.clientY }] };
    try { stage.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (!drag.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      cancelAnims();
    }
    const now = performance.now();
    drag.samples.push({ t: now, x: e.clientX, y: e.clientY });
    while (drag.samples.length > 2 && now - drag.samples[0].t > 100) drag.samples.shift();
    if (drag.axis === 'x') {
      let tx = dx;
      if ((dx > 0 && idx === 0) || (dx < 0 && idx === total - 1)) tx = dx * FRICTION;
      drag.dx = dx;
      img.style.transform = `translate3d(${tx}px, 0, 0)`;
    } else {
      const ty = Math.max(0, dy);
      drag.dy = ty;
      img.style.transform = `translate3d(0, ${ty}px, 0)`;
      scrim.style.opacity = String(Math.max(0.15, 1 - ty / (innerHeight * 0.6)));
    }
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    try { stage.releasePointerCapture(e.pointerId); } catch { /* not captured */ }
    if (!d.axis) return;
    swallowClick = true;
    setTimeout(() => { swallowClick = false; }, 50);
    const a = d.samples[0];
    const b = d.samples[d.samples.length - 1];
    const dt = Math.max(1, b.t - a.t);
    const vx = (b.x - a.x) / dt;
    const vy = (b.y - a.y) / dt;
    if (e.type === 'pointercancel') { springBack(); return; }
    if (d.axis === 'y') {
      if (d.dy > DISMISS_PX || (vy > COMMIT_VEL && d.dy > MIN_COMMIT_PX)) { requestClose(true); return; }
      springBack();
      return;
    }
    const W = stage.clientWidth;
    const dir = d.dx < 0 ? 1 : -1; // swiping left shows the next photo
    const can = idx + dir >= 0 && idx + dir < total;
    const commits = Math.abs(d.dx) >= W * COMMIT_FRAC || (Math.abs(vx) > COMMIT_VEL && Math.abs(d.dx) > MIN_COMMIT_PX && Math.sign(vx) === Math.sign(d.dx));
    if (can && commits) slideTo(idx + dir, dir, d.dx); else springBack();
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  function springBack() {
    scrim.style.opacity = '';
    if (reduce()) { img.style.transform = ''; return; }
    const from = getComputedStyle(img).transform;
    const a = track(img.animate({ transform: [from, 'none'] }, { duration: 260, easing: EASE_OUT }));
    img.style.transform = '';
    track(scrim.animate({ opacity: [parseFloat(getComputedStyle(scrim).opacity) || 1, 1] }, { duration: 260, easing: EASE_OUT }));
    a.onfinish = () => { anims = anims.filter((x) => x !== a); };
  }

  // Committed horizontal swipe: state changes at once, the image slides out and the new one slides in.
  function slideTo(n, dir, dx) {
    const my = ++token;
    idx = n;
    updateChrome();
    setOrigin(n);
    try { history.replaceState({ lb: idOf(n) }, ''); } catch { /* sandboxed */ }
    const swap = () => {
      if (my !== token) return;
      img.style.transform = '';
      fit(n);
      applySrc(pic, data[n], 'lo');
      decode(img).then(() => {
        if (my !== token) return;
        busy = false;
        if (!reduce()) track(img.animate({ transform: [`translate3d(${dir * 48}px, 0, 0)`, 'none'], opacity: [0, 1] }, { duration: 220, easing: EASE_OUT }));
        token = my - 1; // let render() claim a fresh token
        render(n);
      });
    };
    busy = true;
    if (reduce()) { swap(); return; }
    const W = stage.clientWidth;
    const from = getComputedStyle(img).transform;
    img.style.transform = '';
    const a = track(img.animate({ transform: [from, `translate3d(${-dir * W}px, 0, 0)`], opacity: [1, 0] }, { duration: 140, easing: EASE_OUT, fill: 'forwards' }));
    a.onfinish = () => { a.cancel(); swap(); };
  }
}
