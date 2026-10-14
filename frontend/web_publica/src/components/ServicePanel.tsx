import React, { useState } from 'react';
import { ChevronDown, Image as ImageIcon, Play } from 'lucide-react';
import type { ServiceItem } from '@/data/servicios';

interface ServicePanelProps {
  service: ServiceItem;
  open: boolean;
  onToggle: () => void;
  onQuote: (id: string) => void;
}

export const ServicePanel: React.FC<ServicePanelProps> = ({
  service,
  open,
  onToggle,
  onQuote,
}) => {
  const media = service.gallery;
  const [active, setActive] = useState(() => {
    const firstVideo = media.findIndex((item) => item.type === 'video');
    return firstVideo >= 0 ? firstVideo : 0;
  });
  const current = media[active];

  return (
    <article className={`acc ${open ? 'is-open' : ''}`}>
      <h3>
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="group flex w-full items-center justify-between gap-6 py-6 text-left"
        >
          <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
            <span className="title text-ink transition-colors duration-200 group-hover:text-ink/70">
              {service.title}
            </span>
            <span className="text-small text-muted">{service.category}</span>
          </span>
          <ChevronDown
            className={`h-6 w-6 shrink-0 text-muted transition-transform duration-300 ${
              open ? 'rotate-180 text-ink' : ''
            }`}
          />
        </button>
      </h3>

      <div className="acc__panel">
        <div>
          <div className="grid12 gap-y-9 pb-10">
            <div className="col-span-12 lg:col-span-6">
              <p className="lead">{service.fullDescription}</p>

              <ul className="mt-7 space-y-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-body text-ink/90">
                    <span
                      className="mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink/35"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {service.specs.map((spec) => (
                  <div key={spec.label} className="pt-1">
                    <dt className="text-small text-muted">{spec.label}</dt>
                    <dd className="text-body text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <button onClick={() => onQuote(service.id)} className="btn btn--primary mt-9">
                Pedir cotización
              </button>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-ground-2">
                {current ? (
                  current.type === 'video' ? (
                    <video
                      key={current.url}
                      src={current.url}
                      poster={service.featuredImage}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={current.url}
                      alt={current.caption || service.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>

              {media.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {media.map((item, index) => (
                    <button
                      key={item.url}
                      onClick={() => setActive(index)}
                      aria-label={item.caption}
                      aria-pressed={index === active}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden border transition-colors duration-200 ${
                        index === active
                          ? 'border-accent'
                          : 'border-transparent opacity-55 hover:opacity-100'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <span className="flex h-full w-full items-center justify-center bg-surface-2 text-ink">
                          <Play className="h-5 w-5" />
                        </span>
                      ) : (
                        <img
                          src={item.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-4 text-small text-muted">
                Ideal para {service.idealFor.join(' · ').toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
