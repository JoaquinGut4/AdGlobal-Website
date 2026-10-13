import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowRight, Video, Image as ImageIcon } from 'lucide-react';
import { ServiceItem } from '../data/servicios';

interface ServiceModalProps {
  service: ServiceItem | null;
  servicesList: ServiceItem[];
  onClose: () => void;
  onSelectService: (service: ServiceItem) => void;
  onQuoteThisService: (serviceId: string) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  servicesList,
  onClose,
  onSelectService,
  onQuoteThisService
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'gallery' | 'video'>('gallery');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
    setActiveMediaTab('gallery');
  }, [service]);

  // Handle ESC key and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!service) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') navigateService('next');
      if (e.key === 'ArrowLeft') navigateService('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [service, servicesList]);

  if (!service) return null;

  const currentIndex = servicesList.findIndex((s) => s.id === service.id);

  const navigateService = (direction: 'prev' | 'next') => {
    if (currentIndex === -1) return;
    const nextIdx =
      direction === 'next'
        ? (currentIndex + 1) % servicesList.length
        : (currentIndex - 1 + servicesList.length) % servicesList.length;
    onSelectService(servicesList[nextIdx]);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-service-title"
    >
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#2B5C94] uppercase tracking-wider">
              {service.category}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-medium">
              Servicio {currentIndex + 1} de {servicesList.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next buttons */}
            <button
              onClick={() => navigateService('prev')}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Servicio anterior (Flecha Izquierda)"
              aria-label="Servicio anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateService('next')}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Servicio siguiente (Flecha Derecha)"
              aria-label="Servicio siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Cerrar (Esc)"
              aria-label="Cerrar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header info: Title & Breve Descripción */}
          <div>
            <h2
              id="modal-service-title"
              className="text-2xl sm:text-3xl font-extrabold text-[#11233D] tracking-tight mb-2.5"
            >
              {service.title}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              {service.shortDescription}
            </p>
          </div>

          {/* Media Section: Fotos & Videos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveMediaTab('gallery')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeMediaTab === 'gallery'
                      ? 'bg-[#233A5E] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Fotos ({service.gallery.length})</span>
                </button>

                {service.video && (
                  <button
                    onClick={() => setActiveMediaTab('video')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeMediaTab === 'video'
                        ? 'bg-[#233A5E] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video</span>
                  </button>
                )}
              </div>
            </div>

            {/* Media Display Area */}
            {activeMediaTab === 'gallery' ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner group">
                  <img
                    src={service.gallery[activeImageIndex]?.url || service.featuredImage}
                    alt={service.gallery[activeImageIndex]?.caption || service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                  {/* Image Caption overlay */}
                  {service.gallery[activeImageIndex]?.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-sm">
                      <p>{service.gallery[activeImageIndex]?.caption}</p>
                    </div>
                  )}
                </div>

                {/* Thumbnails row */}
                {service.gallery.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {service.gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-[#2B5C94] ring-2 ring-blue-300 scale-102'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Video Display Area */
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black shadow-inner">
                {service.video ? (
                  <iframe
                    src={`${service.video.src}?autoplay=1&mute=1`}
                    title={service.video.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    Video no disponible
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
            <button
              onClick={() => {
                onQuoteThisService(service.id);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-white bg-[#2B5C94] hover:bg-[#3878BE] active:bg-[#1E4573] shadow-lg shadow-[#2B5C94]/25 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Cotizar este servicio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
