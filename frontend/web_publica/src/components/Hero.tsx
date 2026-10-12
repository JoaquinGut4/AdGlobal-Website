import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { HERO_MEDIA, HERO_ROTATING_WORDS } from '@/data/contenido';

interface HeroProps {
  onOpenQuote: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimatingText, setIsAnimatingText] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimatingText(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % HERO_ROTATING_WORDS.length);
        setIsAnimatingText(false);
      }, 350);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 overflow-hidden bg-[#0A1424]"
    >
      {/* Background: cinematic hero video with poster fallback */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_MEDIA.poster}
          aria-hidden="true"
        >
          <source src={HERO_MEDIA.video} type="video/mp4" />
        </video>

        {/* Layered high-contrast navy scrims */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1424] via-[#0E1D36]/85 to-[#0A1424]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1424] via-transparent to-[#0A1424]/60" />

        {/* Ambient Subtle Tech Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto w-full">
        <div className="max-w-3xl lg:max-w-4xl">
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-blue-300 mb-6">
            <span className="w-6 h-0.5 bg-[#3878BE]" />
            <span>Infraestructura Tecnológica Empresarial</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-6 text-balance">
            Alquiler y Venta de Tecnología para tus Eventos y Empresas:
            <span className="block mt-2 min-h-[1.25em]">
              <span
                className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 transition-all duration-300 ${
                  isAnimatingText ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
                }`}
              >
                {HERO_ROTATING_WORDS[currentWordIndex]}
              </span>
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mb-10 text-pretty font-normal">
            Equipamiento tecnológico integral para empresas, cumbres corporativas, proyectos
            mineros y ferias. Garantizamos soporte técnico presencial 24/7, equipos de última
            generación y cobertura a nivel nacional e internacional.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenQuote}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-[#2B5C94] hover:bg-[#346db0] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-[#2B5C94]/30 hover:shadow-[#2B5C94]/45 group cursor-pointer"
            >
              <span>Cotizar ahora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#servicios"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm sm:text-base font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-white/25 transition-all duration-200"
            >
              <span>Ver servicios</span>
            </a>
          </div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center text-slate-400 text-xs uppercase tracking-widest gap-2 pt-4">
        <span>Desplazar hacia abajo</span>
        <a
          href="#servicios"
          className="p-2 rounded-full border border-white/20 hover:border-white/50 text-slate-300 hover:text-white transition-colors animate-bounce"
          aria-label="Desplazar a servicios"
        >
          <ArrowDown className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};
