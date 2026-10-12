import React from 'react';
import { CLIENTES_LOGOS } from '@/data/contenido';
import { Building2 } from 'lucide-react';

export const ClientsMarquee: React.FC = () => {
  // Duplicate logos array to make an endless seamless marquee loop
  const doubleLogos = [...CLIENTES_LOGOS, ...CLIENTES_LOGOS];

  return (
    <section id="clientes" className="py-20 bg-white border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2B5C94] mb-3">
          <span className="w-5 h-0.5 bg-[#2B5C94]" />
          <span>Confianza Corporativa</span>
          <span className="w-5 h-0.5 bg-[#2B5C94]" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14233c] tracking-tight mb-4 text-balance">
          Nuestros Clientes
        </h2>
        <p className="text-base text-slate-600 max-w-2xl mx-auto font-normal">
          Empresas líderes que confían en la infraestructura tecnológica y soporte en vivo de AD
          GLOBAL para sus operaciones críticas y eventos.
        </p>
      </div>

      {/* Marquee Wrapper with soft edge fades */}
      <div className="relative w-full overflow-hidden py-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center gap-8 sm:gap-12">
          {doubleLogos.map((client, idx) => (
            <div
              key={`${client.id}-${idx}`}
              className="flex items-center gap-3 px-6 py-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#2B5C94]/40 hover:bg-slate-100/80 transition-all duration-300 group cursor-default select-none shrink-0 min-w-[200px]"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-200/70 group-hover:bg-[#2B5C94]/15 flex items-center justify-center text-slate-500 group-hover:text-[#2B5C94] transition-colors shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-slate-700 group-hover:text-[#11233D] grayscale group-hover:grayscale-0 transition-all tracking-tight">
                  {client.logoText}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{client.industry}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
