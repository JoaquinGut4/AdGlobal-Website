import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ServiceItem } from '@/data/servicios';

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
  onQuoteThisService,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'gallery' | 'video'>('gallery');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const images = useMemo(
    () => service?.gallery.filter((m) => m.type === 'image') ?? [],
    [service]
  );
  const videos = useMemo(
    () => service?.gallery.filter((m) => m.type === 'video') ?? [],
    [service]
  );

  useEffect(() => {
    setActiveImageIndex(0);
    setActiveVideoIndex(0);
    setActiveMediaTab('gallery');
  }, [service]);

  // Lock body scroll while the modal is open
  useEffect(() => {
    if (!service) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [service]);

  // ESC key closes the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!service) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [service, onClose]);

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
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95 duration-200"
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
            <button
              onClick={() => navigateService('prev')}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Servicio anterior"
              aria-label="Servicio anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateService('next')}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Servicio siguiente"
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
        <div className="p-6 sm:p-8 space-y-7">
          {/* Header info */}
          <div>
            <h2
              id="modal-service-title"
              className="text-2xl sm:text-3xl font-extrabold text-[#11233D] tracking-tight mb-2.5"
            >
              {service.title}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal mb-3">
              {service.shortDescription}
            </p>
            <p className="text-sm text-slate-500 leading-relaxed font-normal">
              {service.fullDescription}
            </p>
          </div>

          {/* Media Section */}
          {service.gallery.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                {images.length > 0 && (
                  <button
                    onClick={() => setActiveMediaTab('gallery')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeMediaTab === 'gallery'
                        ? 'bg-[#233A5E] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Fotos ({images.length})</span>
                  </button>
                )}

                {videos.length > 0 && (
                  <button
                    onClick={() => setActiveMediaTab('video')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeMediaTab === 'video'
                        ? 'bg-[#233A5E] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video ({videos.length})</span>
                  </button>
                )}
              </div>

              {/* Gallery */}
              {activeMediaTab === 'gallery' && images.length > 0 && (
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner group">
                    <img
                      src={images[activeImageIndex]?.url}
                      alt={images[activeImageIndex]?.caption || service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {images[activeImageIndex]?.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-sm">
                        <p>{images[activeImageIndex]?.caption}</p>
                      </div>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            activeImageIndex === idx
                              ? 'border-[#2B5C94] ring-2 ring-blue-300'
                              : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.caption}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Videos */}
              {activeMediaTab === 'video' && videos.length > 0 && (
                <div className="space-y-3">
                  <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black shadow-inner">
                    <video
                      key={videos[activeVideoIndex]?.url}
                      src={videos[activeVideoIndex]?.url}
                      controls
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full"
                    >
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  </div>
                  {videos[activeVideoIndex]?.caption && (
                    <p className="text-sm text-slate-500">{videos[activeVideoIndex]?.caption}</p>
                  )}

                  {videos.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {videos.map((_video, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveVideoIndex(idx)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                            activeVideoIndex === idx
                              ? 'bg-[#233A5E] text-white border-[#233A5E]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Video {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Features */}
          {service.features.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#233A5E] mb-3">
                <Sparkles className="w-4 h-4 text-sky-500" />
                Características
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specs */}
          {service.specs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#233A5E] mb-3">
                Especificaciones Técnicas
              </h3>
              <dl className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {service.specs.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-4 py-3">
                    <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {spec.label}
                    </dt>
                    <dd className="sm:col-span-2 text-sm text-slate-700">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Ideal For */}
          {service.idealFor.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#233A5E] mb-3">
                Ideal para
              </h3>
              <div className="flex flex-wrap gap-2">
                {service.idealFor.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

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
