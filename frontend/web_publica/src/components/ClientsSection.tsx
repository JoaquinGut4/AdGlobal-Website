import React from 'react';
import { CLIENT_LOGOS } from '@/data/clientes';
import { useSiteData } from '@/hooks/useSiteData';

export const ClientsSection: React.FC = () => {
  const { content } = useSiteData();
  const industrias = content.industrias;
  const loop = [...CLIENT_LOGOS, ...CLIENT_LOGOS];

  return (
    <section id="clientes" className="section bg-paper text-paper-ink">
      <div className="wrap grid12 gap-y-6">
        <h2 className="heading col-span-12 lg:col-span-5" data-reveal>
          Nuestros clientes
        </h2>
        <p
          className="col-span-12 max-w-[54ch] text-body leading-relaxed text-paper-muted lg:col-span-6 lg:col-start-7"
          data-reveal
          style={{ '--i': 1 } as React.CSSProperties}
        >
          Más de 500 empresas en Perú y Colombia confían su operación a AD GLOBAL:{' '}
          {industrias.join(', ').toLowerCase()} y más.
        </p>
      </div>

      <div className="edge-fade mt-[clamp(2.5rem,5vw,4rem)] overflow-hidden">
        <div className="marquee items-center gap-14 sm:gap-24">
          {loop.map((src, index) => (
            <img
              key={`${src}-${index}`}
              src={src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="h-9 w-auto shrink-0 object-contain mix-blend-multiply opacity-75 sm:h-11"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
