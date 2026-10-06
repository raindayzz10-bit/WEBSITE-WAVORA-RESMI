import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

/**
 * Initialize Lenis smooth scroll engine
 */
export function initSmoothScroll(): () => void {
  if (typeof window === 'undefined') return () => {};

  if (lenisInstance) {
    lenisInstance.destroy();
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.8,
  });

  lenisInstance = lenis;
  (window as unknown as { __lenis: Lenis }).__lenis = lenis;

  let animationFrameId: number;

  function raf(time: number) {
    lenis.raf(time);
    animationFrameId = requestAnimationFrame(raf);
  }

  animationFrameId = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(animationFrameId);
    lenis.destroy();
    lenisInstance = null;
    delete (window as unknown as { __lenis?: Lenis }).__lenis;
  };
}

/**
 * Smoothly glide to any section or element
 */
export function smoothScrollTo(
  target: string | HTMLElement,
  options?: { offset?: number; duration?: number }
): void {
  const cleanSelector = typeof target === 'string' 
    ? (target.startsWith('#') ? target : `#${target}`)
    : target;

  if (lenisInstance) {
    lenisInstance.scrollTo(cleanSelector, {
      offset: options?.offset ?? -80,
      duration: options?.duration ?? 1.2,
    });
    return;
  }

  // Fallback if Lenis is not active
  if (typeof target === 'string') {
    const id = target.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
