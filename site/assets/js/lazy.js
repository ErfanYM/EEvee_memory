// Deferred image loading (P1/P2). Below-the-fold pictures ship their URLs in data-* attributes. Until the window
// load event only a picture already on screen is released, so the hero (the LCP) has the network to itself;
// after load, everything within ~1200px is released, then the rest as it nears the viewport.
const ATTRS = ['srcset', 'src'];

function release(pic) {
  if (!pic.hasAttribute('data-lazy')) return;
  pic.removeAttribute('data-lazy');
  for (const el of pic.querySelectorAll('source, img')) {
    for (const a of ATTRS) {
      const v = el.getAttribute(`data-${a}`);
      if (v) { el.setAttribute(a, v); el.removeAttribute(`data-${a}`); }
    }
  }
}

export function initLazy(root = document) {
  const pics = [...root.querySelectorAll('picture[data-lazy]')];
  if (!pics.length) return;
  if (!('IntersectionObserver' in window)) { pics.forEach(release); return; }
  let io;
  const watch = (margin) => {
    io?.disconnect();
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); release(e.target); }
    }, { rootMargin: margin });
    pics.forEach((p) => { if (p.hasAttribute('data-lazy')) io.observe(p); });
  };
  watch('0px');
  const later = () => watch('1200px 0px');
  if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
  window.addEventListener('beforeprint', () => pics.forEach(release));
}
