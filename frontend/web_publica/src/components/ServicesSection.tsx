import React from 'react';
import { SERVICIOS_DATA } from '@/data/servicios';
import { ServicePanel } from './ServicePanel';

interface ServicesSectionProps {
  openId: string;
  onToggle: (id: string) => void;
  onQuote: (id: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ openId, onToggle, onQuote }) => (
  <section id="servicios" className="section">
    <div className="wrap">
      <div className="grid12 gap-y-8">
        <h2 className="heading col-span-12 text-ink lg:col-span-4" data-reveal>
          Servicios
        </h2>
        <p
          className="lead col-span-12 lg:col-span-7 lg:col-start-6"
          data-reveal
          style={{ '--i': 1 } as React.CSSProperties}
        >
          Tenemos ocho líneas de servicios listas para alquilar o comprar. Abre cada una para ver la
          descripción, las fotos y el video.
        </p>
      </div>

      <div className="mt-[clamp(2.5rem,5vw,4.5rem)]">
        {SERVICIOS_DATA.map((service) => (
          <ServicePanel
            key={service.id}
            service={service}
            open={openId === service.id}
            onToggle={() => onToggle(service.id)}
            onQuote={onQuote}
          />
        ))}
      </div>
    </div>
  </section>
);
