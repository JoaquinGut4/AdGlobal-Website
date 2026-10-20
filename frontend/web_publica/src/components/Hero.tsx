import React, { useEffect, useMemo, useState } from 'react';
import { HERO } from '@/data/contenido';
import { SERVICIOS_DATA, type ServiceItem } from '@/data/servicios';
import { useManagedWebImages } from '@/hooks/useManagedWebImages';

/** Etiquetas cortas para el índice interactivo del banner. */
const SHORT_LABEL: Record<string, string> = {
  'laptops-computadores': 'Laptops',
  tablets: 'Tablets',
  'impresoras-multifuncionales': 'Impresoras',
  proyectores: 'Proyectores',
  'equipos-audiovisuales': 'Audiovisuales',
  'totems-digitales': 'Tótems',
  'pantallas-led': 'Pantallas LED',
  'desarrollo-web': 'Desarrollo web',
};

/** Orden de los objetos que aparecen en la sala. Las pantallas LED abren. */
const HERO_ORDER = [
  'pantallas-led',
  'equipos-audiovisuales',
  'laptops-computadores',
  'proyectores',
  'totems-digitales',
  'tablets',
  'impresoras-multifuncionales',
  'desarrollo-web',
];

/** Escapa los caracteres especiales de una frase para usarla dentro de un RegExp. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Divide la frase principal y envuelve las frases clave en `.hero__mark`,
 * que llevan el subrayado animado (ver index.css).
 */
const renderHeadline = (text: string, marks: readonly string[]) => {
  if (marks.length === 0) return text;

  const pattern = new RegExp(`(${marks.map(escapeRegExp).join('|')})`, 'g');
  return text.split(pattern).map((part, index) =>
    marks.includes(part) ? (
      <span
        key={`mark-${index}`}
        className="hero__mark"
        style={{ '--mark-i': marks.indexOf(part) } as React.CSSProperties}
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={`text-${index}`}>{part}</React.Fragment>
    )
  );
};

interface HeroProps {
  onQuote: () => void;
}

interface HeroExhibit {
  id: string;
  title: string;
  featuredImage: string;
  type: 'image' | 'video';
}

export const Hero: React.FC<HeroProps> = ({ onQuote }) => {
  const managedImages = useManagedWebImages();
  const exhibits = useMemo<HeroExhibit[]>(() => {
    const managedHero = managedImages.filter((image) => image.section === 'hero');
    if (managedHero.length > 0) {
      return managedHero.map((image, index) => ({
        id: image.id,
        title: image.name || `Banner ${index + 1}`,
        featuredImage: image.dataUrl,
        type: image.type,
      }));
    }

    return HERO_ORDER.map((id) => SERVICIOS_DATA.find((service) => service.id === id))
      .filter((service): service is ServiceItem => Boolean(service?.featuredImage))
      .map((service) => ({
        id: service.id,
        title: service.title,
        featuredImage: service.featuredImage as string,
        type: 'image' as const,
      }));
  }, [managedImages]);

  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    setActive((index) => (exhibits.length === 0 ? 0 : Math.min(index, exhibits.length - 1)));
  }, [exhibits.length]);

  useEffect(() => {
    if (!auto || exhibits.length < 2) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % exhibits.length),
      5200
    );
    return () => window.clearInterval(timer);
  }, [auto, exhibits.length]);

  return (
    <section id="inicio" className="relative flex min-h-[100svh] flex-col">
      {/* Escenario: un objeto iluminado dentro de la sala oscura */}
      <div className="hero__stage relative flex-1 min-h-[42svh] w-full overflow-hidden bg-surface">
        {exhibits.map((service, index) =>
          service.type === 'video' ? (
            <video
              key={service.id}
              src={service.featuredImage}
              aria-hidden={index !== active}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className={`hero__exhibit ${index === active ? 'is-on' : ''}`}
            />
          ) : (
            <img
              key={service.id}
              src={service.featuredImage}
              alt={index === active ? `${service.title} de AD GLOBAL` : ''}
              aria-hidden={index !== active}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`hero__exhibit ${index === active ? 'is-on' : ''}`}
            />
          ),
        )}
        <div className="hero__scrim pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="wrap pb-5">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {exhibits.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setActive(index);
                    setAuto(false);
                  }}
                  aria-pressed={index === active}
                  className={`text-small transition-colors duration-200 ${
                    index === active ? 'text-ink' : 'text-ink/40 hover:text-ink/75'
                  }`}
                >
                  {SHORT_LABEL[service.id] ?? service.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Banda de tierra: la frase protagonista, la frase de apoyo y la acción */}
      <div className="wrap pt-[clamp(1.5rem,3vw,2.5rem)] pb-[clamp(4rem,8vw,6.5rem)]">
        <h1
          data-rise
          style={{ '--i': 0 } as React.CSSProperties}
          className="heading text-ink"
        >
          {renderHeadline(HERO.headline, HERO.highlights)}
        </h1>

        <div className="grid12 mt-5 items-end gap-y-5">
          <p
            data-rise
            style={{ '--i': 1 } as React.CSSProperties}
            className="col-span-12 max-w-[48ch] text-body leading-relaxed text-muted lg:col-span-6"
          >
            {HERO.supporting}
          </p>
          <div
            data-rise
            style={{ '--i': 2 } as React.CSSProperties}
            className="col-span-12 lg:col-span-6 lg:justify-self-end"
          >
            <button onClick={onQuote} className="btn btn--quote">
              {HERO.action}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
