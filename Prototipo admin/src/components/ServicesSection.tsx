import React, { useState } from 'react';
import { ArrowUpRight, Monitor, Laptop, Printer, Code2, Volume2, Tablet, Sparkles } from 'lucide-react';
import { SERVICIOS_DATA, ServiceItem } from '../data/servicios';
import { ServiceModal } from './ServiceModal';

interface ServicesSectionProps {
  onQuoteService: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onQuoteService }) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'pantallas-led':
        return <Monitor className="w-5 h-5 text-blue-400" />;
      case 'laptops-computadores':
        return <Laptop className="w-5 h-5 text-sky-400" />;
      case 'equipos-audiovisuales':
        return <Volume2 className="w-5 h-5 text-amber-400" />;
      case 'tablets':
        return <Tablet className="w-5 h-5 text-emerald-400" />;
      case 'impresoras-multifuncionales':
        return <Printer className="w-5 h-5 text-indigo-400" />;
      case 'desarrollo-web':
        return <Code2 className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <section id="servicios" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2B5C94] mb-3">
            <span className="w-5 h-0.5 bg-[#2B5C94]" />
            <span>Portafolio Tecnológico Integral</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14233c] tracking-tight mb-4 text-balance">
            Nuestros Servicios
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Soluciones de alquiler y venta con respaldo técnico in-situ para empresas, congresos y proyectos en todo el territorio nacional e internacional.
          </p>
        </div>

        {/* 6 Cards Grid - Generated dynamically from SERVICIOS_DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICIOS_DATA.map((service, index) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 hover:border-[#2B5C94]/40 hover:shadow-2xl hover:shadow-[#2B5C94]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Image Container with Zoom & Overlay */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={service.featuredImage}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  referrerPolicy="no-referrer"
                />
                {/* Gradient overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d182b] via-[#0d182b]/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Floating category marker without pill enclosures */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-semibold text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
                  {getServiceIcon(service.id)}
                  <span>{service.category}</span>
                </div>

                {/* Quick view button hint */}
                <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#2B5C94] px-3.5 py-1.5 rounded-lg shadow-lg">
                    Ver fotos y video
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Card Text Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#14233c] tracking-tight group-hover:text-[#2B5C94] transition-colors">
                      {service.title}
                    </h3>
                    <div className="p-2 rounded-full bg-slate-100 text-slate-400 group-hover:bg-[#2B5C94] group-hover:text-white transition-all shrink-0">
                      <ArrowUpRight className="w-5 h-5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center text-xs font-bold text-[#2B5C94] group-hover:text-[#1e4573] transition-colors">
                  <span>Ver galería de fotos y video</span>
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox / Modal */}
      <ServiceModal
        service={selectedService}
        servicesList={SERVICIOS_DATA}
        onClose={() => setSelectedService(null)}
        onSelectService={(serv) => setSelectedService(serv)}
        onQuoteThisService={(servId) => onQuoteService(servId)}
      />
    </section>
  );
};
