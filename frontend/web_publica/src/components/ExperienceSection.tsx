import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Award,
  Users,
  Cpu,
  MapPin,
  Globe,
  ShieldCheck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { METRICAS_DATA, MetricItem } from '@/data/contenido';

export const ExperienceSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});

  // IntersectionObserver to start number count-up animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Count-up numbers animation
  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      const nextCounts: { [key: string]: number } = {};
      METRICAS_DATA.forEach((m) => {
        nextCounts[m.id] = Math.floor(ease * m.value);
      });
      setCounts(nextCounts);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalCounts: { [key: string]: number } = {};
        METRICAS_DATA.forEach((m) => {
          finalCounts[m.id] = m.value;
        });
        setCounts(finalCounts);
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimated]);

  // Seamless continuous auto-scroll with pause on hover/interaction
  useEffect(() => {
    let animId: number;
    const scrollStep = () => {
      if (!isPaused && trackRef.current) {
        trackRef.current.scrollLeft += 0.8;
        if (trackRef.current.scrollLeft >= trackRef.current.scrollWidth / 2) {
          trackRef.current.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(scrollStep);
    };

    animId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  // Manual transition step
  const handleManualTransition = (direction: 'prev' | 'next') => {
    if (!trackRef.current) return;
    const stepSize = 360;

    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);

    if (direction === 'next') {
      if (trackRef.current.scrollLeft >= trackRef.current.scrollWidth / 2) {
        trackRef.current.scrollLeft = 0;
      }
      trackRef.current.scrollBy({ left: stepSize, behavior: 'smooth' });
    } else {
      if (trackRef.current.scrollLeft <= 10) {
        trackRef.current.scrollLeft = trackRef.current.scrollWidth / 2;
      }
      trackRef.current.scrollBy({ left: -stepSize, behavior: 'smooth' });
    }
  };

  const renderIcon = (name: MetricItem['iconName']) => {
    const props = { className: 'w-6 h-6 text-sky-400' };
    switch (name) {
      case 'calendar':
        return <Calendar {...props} />;
      case 'award':
        return <Award {...props} />;
      case 'users':
        return <Users {...props} />;
      case 'cpu':
        return <Cpu {...props} />;
      case 'mapPin':
        return <MapPin {...props} />;
      case 'globe':
        return <Globe {...props} />;
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('es-PE');

  const loopMetrics = [...METRICAS_DATA, ...METRICAS_DATA];

  return (
    <section
      id="experiencia"
      ref={sectionRef}
      className="py-24 bg-[#233A5E] text-white relative overflow-hidden"
    >
      {/* Background Subtle Tech Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-300 rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-300 mb-3">
            <span className="w-5 h-0.5 bg-sky-400" />
            <span>Trayectoria Comprobada en el Mercado</span>
            <span className="w-5 h-0.5 bg-sky-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 text-balance">
            Nuestra Experiencia en Cifras
          </h2>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
            Más de una década brindando soporte tecnológico de alto nivel para los eventos
            corporativos más exigentes del país y la región.
          </p>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative w-full py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 group">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#233A5E] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#233A5E] to-transparent z-10 pointer-events-none" />

          <button
            onClick={() => handleManualTransition('prev')}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#112036]/90 hover:bg-[#2B5C94] text-white border border-white/20 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer hover:shadow-sky-400/20"
            title="Transicionar a la métrica anterior"
            aria-label="Métrica anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleManualTransition('next')}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#112036]/90 hover:bg-[#2B5C94] text-white border border-white/20 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer hover:shadow-sky-400/20"
            title="Transicionar a la siguiente métrica"
            aria-label="Siguiente métrica"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={trackRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex items-stretch gap-6 sm:gap-8 overflow-x-auto scroll-smooth py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {loopMetrics.map((metric, idx) => {
              const currentVal = counts[metric.id] ?? (hasAnimated ? metric.value : 0);

              return (
                <div
                  key={`${metric.id}-${idx}`}
                  className="bg-[#1B2F4D]/90 border border-white/10 hover:border-sky-400/50 hover:bg-[#1f385e] rounded-2xl p-7 min-w-[290px] sm:min-w-[340px] max-w-[360px] shrink-0 transition-all duration-300 flex flex-col justify-between group shadow-xl select-none"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="p-3 rounded-xl bg-white/10 group-hover:bg-sky-400/20 transition-colors">
                        {renderIcon(metric.iconName)}
                      </div>
                      <span className="text-xs font-mono text-sky-300 tracking-wider uppercase font-semibold">
                        Auditado
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-2 font-mono tabular-nums">
                      {metric.prefix && (
                        <span className="text-3xl sm:text-4xl font-extrabold text-sky-400">
                          {metric.prefix}
                        </span>
                      )}
                      <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                        {formatNumber(currentVal)}
                      </span>
                      {metric.suffix && (
                        <span className="text-xl sm:text-2xl font-bold text-sky-300">
                          {metric.suffix}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{metric.label}</h3>

                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {metric.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-sky-200">
                      <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                      Capacidad 100% garantizada
                    </span>
                    <span className="font-mono text-slate-400">AD GLOBAL</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Corporate Trust Strip */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-[#172844] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3.5 rounded-xl bg-sky-400/10 text-sky-300 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Garantía de Continuidad Operativa</h4>
              <p className="text-sm text-slate-300">
                Cada evento cuenta con personal técnico certificado in-situ y equipos de respaldo
                en caliente (hot-swap).
              </p>
            </div>
          </div>

          <a
            href="#contacto"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm bg-white text-[#233A5E] hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 shadow-lg"
          >
            Hablar con un asesor técnico
          </a>
        </div>
      </div>
    </section>
  );
};
