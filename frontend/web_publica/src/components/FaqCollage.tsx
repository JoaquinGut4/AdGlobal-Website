import React, { useEffect, useRef, useState } from 'react';

import fotoPantallas from '@/assets/servicios/pantallas-led/PantallasLED 1.jpeg';
import fotoAudio from '@/assets/servicios/audiovisuales/Audiovisual 1.jpg';
import fotoTotem from '@/assets/servicios/Totems/Totems 3.jpeg';
import fotoLaptops from '@/assets/servicios/laptops/Laptops 1.webp';
import fotoTablets from '@/assets/servicios/tablets/Tablets 1.jpg';

/** Las cinco fotos del collage de Preguntas frecuentes. */
const FOTOS = [fotoPantallas, fotoAudio, fotoTotem, fotoLaptops, fotoTablets];

/** Forma de cada pieza del mosaico. La primera ocupa dos columnas. */
const PIEZAS = [
  'col-span-2 aspect-[3/2]',
  'aspect-[3/4]',
  'aspect-square',
  'aspect-square',
  'aspect-square',
];

/** Cada cuánto rota el mosaico (ms). */
const ROTACION = 3600;

/**
 * Collage de Preguntas frecuentes.
 *
 * Cinco piezas; cada una muestra una foto distinta y el mosaico va rotando
 * con un fundido. Las piezas se revelan juntas como una cortina al entrar
 * en pantalla (ver `.collage` en index.css). La rotación se pausa mientras
 * el mosaico está fuera de pantalla.
 */
export const FaqCollage: React.FC = () => {
  const [tick, setTick] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer = 0;
    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => setTick((value) => value + 1), ROTACION);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };

    const node = rootRef.current;
    if (!node || !('IntersectionObserver' in window)) {
      start();
      return stop;
    }

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  return (
    <div ref={rootRef} className="collage" role="img" aria-label="Equipos instalados por AD GLOBAL">
      {PIEZAS.map((pieza, slot) => {
        const activa = (tick + slot) % FOTOS.length;
        return (
          <div key={pieza + slot} className={`collage__slot ${pieza}`}>
            {FOTOS.map((foto, index) => (
              <img
                key={foto}
                src={foto}
                alt=""
                loading="lazy"
                decoding="async"
                className={`collage__img ${index === activa ? 'is-on' : ''}`}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};
