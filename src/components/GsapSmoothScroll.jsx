import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function GsapSmoothScroll({ children }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return undefined;

    const root = document.documentElement;
    const refresh = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', handleLoad);

    return () => {
      window.cancelAnimationFrame(refresh);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return children;
}
