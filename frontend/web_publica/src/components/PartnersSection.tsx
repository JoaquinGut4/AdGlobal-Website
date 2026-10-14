import React, { useEffect, useState } from 'react';
import { PARTNERS } from '@/data/contenido';

export const PartnersSection: React.FC = () => {
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setLit((index) => (index + 1) % PARTNERS.length), 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="section section--tight-top">
      <div className="wrap">
        <h2 className="sr-only">Aliados</h2>
        <p className="title text-muted" data-reveal>
          <span className="text-ink">Trabajando con nuestros partners </span>
          {PARTNERS.map((name, index) => (
            <React.Fragment key={name}>
              <span className={`partner ${index === lit ? 'text-ink' : 'text-ink/25'}`}>
                {name}
              </span>
              {index < PARTNERS.length - 1 ? ', ' : '.'}
            </React.Fragment>
          ))}
        </p>
      </div>
    </section>
  );
};
