import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { whatsappLink } from '@/config/site';
import { FaqCollage } from './FaqCollage';
import { useSiteData } from '@/hooks/useSiteData';

export const FAQSection: React.FC = () => {
  const { faqs } = useSiteData();
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <section id="preguntas" className="section">
      <div className="wrap grid12 gap-y-14">
        <div className="col-span-12 lg:col-span-5">
          <h2 className="heading text-ink" data-reveal>
            Preguntas frecuentes
          </h2>

          <div className="mt-[clamp(2rem,4vw,3rem)]" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
            {faqs.map((faq) => {
              const open = openId === faq.id;
              return (
                <div key={faq.id} className={`acc ${open ? 'is-open' : ''}`}>
                  <h3>
                    <button
                      onClick={() => setOpenId(open ? null : faq.id)}
                      aria-expanded={open}
                      className="flex w-full items-start justify-between gap-5 py-5 text-left"
                    >
                      <span className="text-body font-medium text-ink">{faq.question}</span>
                      <Plus
                        className={`mt-0.5 h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${
                          open ? 'rotate-45 text-ink' : ''
                        }`}
                      />
                    </button>
                  </h3>
                  <div className="acc__panel">
                    <div>
                      <p className="max-w-[58ch] pr-6 pb-6 text-body leading-relaxed text-muted">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <a
            href={whatsappLink('Hola AD GLOBAL, tengo una consulta sobre sus servicios.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary mt-9"
          >
            Hablar por WhatsApp
          </a>
        </div>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <FaqCollage />
        </div>
      </div>
    </section>
  );
};
