import { useEffect } from 'react';

/**
 * Revela los bloques marcados con `data-reveal` (y el collage `.collage`)
 * una sola vez, al entrar en pantalla. Si el observador no existe o falla,
 * el contenido queda visible: el estado oculto solo aplica bajo `html.js`.
 */
export const useReveal = () => {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal], .collage')
    );
    if (elements.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
};
