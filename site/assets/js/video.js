// Tap-to-play videos (DESIGN-SYSTEM section 7). Sound on, one at a time, inline, never in the lightbox.
const BUFFER_MS = 400;
const VISIBLE_MIN = 0.1;
const PLAY_PATH = 'M8 5.5v13l11-6.5z';
const RETRY_PATH = 'M12 5a7 7 0 1 0 6.3 4H15V7h6v6h-2v-2.2A9 9 0 1 1 12 3z';

const videos = new Set();

function fig(v) { return v.closest('.polaroid--video'); }
function btn(v) { return fig(v)?.querySelector('.video__play'); }
function glyph(v, d) {
  const p = btn(v)?.querySelector('svg path');
  if (p) p.setAttribute('d', d);
}

// Back to the poster state: paused, native controls off, disc showing, tilt restored.
function resetToPoster(v) {
  const f = fig(v);
  v.pause();
  v.removeAttribute('controls');
  f.classList.remove('is-playing', 'is-buffering', 'is-error');
  glyph(v, PLAY_PATH);
}

export function pauseAllVideos() {
  for (const v of videos) if (!v.paused || v.hasAttribute('controls')) resetToPoster(v);
}

export function initVideos(root = document) {
  const list = [...root.querySelectorAll('.polaroid--video video')];
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.intersectionRatio < VISIBLE_MIN && !e.target.paused) resetToPoster(e.target);
        }
      }, { threshold: [0, VISIBLE_MIN, 0.5, 1] })
    : null;

  for (const v of list) {
    videos.add(v);
    const f = fig(v);
    const b = btn(v);
    let timer = 0;
    const clearBuffer = () => { clearTimeout(timer); timer = 0; f.classList.remove('is-buffering'); };

    // Must call play() synchronously: iOS only grants sound inside the gesture.
    const start = () => {
      for (const o of videos) if (o !== v && !o.paused) resetToPoster(o);
      if (f.classList.contains('is-error')) { f.classList.remove('is-error'); glyph(v, PLAY_PATH); v.load(); }
      v.setAttribute('controls', '');
      f.classList.add('is-playing');
      const p = v.play();
      if (p && p.catch) p.catch(() => { if (v.paused && !f.classList.contains('is-error')) resetToPoster(v); });
    };

    b.addEventListener('click', start);
    // Poster tap (before controls exist) starts playback too.
    v.addEventListener('click', () => { if (!v.hasAttribute('controls')) start(); });

    v.addEventListener('play', () => {
      for (const o of videos) if (o !== v && !o.paused) resetToPoster(o);
      f.classList.add('is-playing');
    });
    v.addEventListener('waiting', () => { if (!timer && !v.paused) timer = setTimeout(() => f.classList.add('is-buffering'), BUFFER_MS); });
    for (const ev of ['playing', 'canplay', 'pause', 'seeked']) v.addEventListener(ev, clearBuffer);
    v.addEventListener('ended', () => { clearBuffer(); resetToPoster(v); });
    v.addEventListener('error', () => {
      clearBuffer();
      v.removeAttribute('controls');
      f.classList.remove('is-playing');
      f.classList.add('is-error');
      glyph(v, RETRY_PATH);
    });
    io?.observe(v);
  }
}
