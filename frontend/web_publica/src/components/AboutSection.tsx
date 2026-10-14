import React from 'react';
import { ABOUT, VENTAJAS } from '@/data/contenido';

export const AboutSection: React.FC = () => (
  <section id="nosotros" className="section section--tight-bottom">
    <div className="wrap">
      <div className="grid12 gap-y-8">
        <h2 className="heading col-span-12 text-ink lg:col-span-4" data-reveal>
          {ABOUT.heading}
        </h2>
        <div className="col-span-12 lg:col-span-8">
          <p className="statement text-ink" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            {ABOUT.statement}
          </p>
          <p
            className="lead mt-7"
            data-reveal
            style={{ '--i': 2 } as React.CSSProperties}
          >
            {ABOUT.description}
          </p>
        </div>
      </div>

      <div className="grid12 mt-[clamp(3rem,6vw,5.5rem)] gap-y-6">
        {[ABOUT.mission, ABOUT.vision].map((block, index) => (
          <div
            key={block.title}
            className="panel col-span-12 p-[clamp(1.5rem,3vw,2.5rem)] sm:col-span-6"
            data-reveal
            style={{ '--i': index } as React.CSSProperties}
          >
            <h3 className="title text-ink">{block.title}</h3>
            <p className="mt-5 max-w-[46ch] text-body leading-relaxed text-muted">{block.text}</p>
          </div>
        ))}
      </div>

      <div className="grid12 mt-[clamp(3rem,6vw,5.5rem)] gap-y-10">
        <h3 className="title col-span-12 text-ink lg:col-span-4" data-reveal>
          Ventajas
        </h3>
        <ul className="col-span-12 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:col-span-8">
          {VENTAJAS.map((item, index) => (
            <li key={item.title} data-reveal style={{ '--i': index } as React.CSSProperties}>
              <h4 className="text-body font-medium text-ink">{item.title}</h4>
              <p className="mt-2 max-w-[42ch] text-body leading-relaxed text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
