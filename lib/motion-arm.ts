/**
 * Progressive-enhancement switch for entrance animations.
 *
 * Runs inline in <head> before first paint. It adds `data-motion-armed` to <html>
 * only when JavaScript runs, IntersectionObserver exists and the user has not asked
 * for reduced motion. CSS hides reveal start states ONLY under that attribute, so:
 *  - JavaScript disabled → never armed → all content visible in server HTML.
 *  - Reduced motion → never armed → content visible, no movement.
 *  - App bundle fails → MotionProvider never marks `data-motion-live` → disarmed after 4s.
 * Arming before paint means content never flashes visible → hidden.
 */
export const MOTION_ARM_SCRIPT = `(function(){try{var d=document.documentElement;if(!('IntersectionObserver' in window))return;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.setAttribute('data-motion-armed','');setTimeout(function(){if(!d.hasAttribute('data-motion-live'))d.removeAttribute('data-motion-armed');},4000);}catch(e){}})();`;
