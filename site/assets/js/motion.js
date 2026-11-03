// Print settle (DESIGN-SYSTEM section 9). Only below-the-fold prints are ever hidden; text never moves.
const REVEAL_DONE_MS = 700;
const FAILSAFE_MS = 2500;

export function initReveal() {
  const root = document.documentElement;
  if (!root.classList.contains('js')) return;
  const prints = [...document.querySelectorAll('.polaroid')];
  const vh = window.innerHeight || root.clientHeight;
  const pending = prints.filter((el) => el.dataset.mediaId !== 'img_8819' && el.getBoundingClientRect().top >= vh);
  if (!pending.length) return;

  const show = (el, step = 0) => {
    if (!el.classList.contains('is-pending')) return;
    el.style.setProperty('--i', String(Math.min(step, 3)));
    el.classList.remove('is-pending');
    el.classList.add('is-in');
    setTimeout(() => el.classList.add('is-done'), REVEAL_DONE_MS + Math.min(step, 3) * 60);
  };
  const showAll = () => pending.forEach((el) => show(el));

  pending.forEach((el) => el.classList.add('is-pending'));
  if (!('IntersectionObserver' in window)) { showAll(); return; }

  const io = new IntersectionObserver((entries) => {
    let step = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      show(e.target, step++);
    }
  }, { threshold: 0.15 });
  pending.forEach((el) => io.observe(el));

  // Failsafe (DESIGN-SYSTEM section 9): a stalled observer must never leave a blank section.
  setTimeout(() => { io.disconnect(); showAll(); }, FAILSAFE_MS);
}
