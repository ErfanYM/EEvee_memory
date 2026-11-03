import { initLazy } from './lazy.js';
import { initReveal } from './motion.js';
import { initVideos } from './video.js';
import { initLightbox } from './lightbox.js';

initLazy();
initReveal();
initVideos(document);
initLightbox(document);
