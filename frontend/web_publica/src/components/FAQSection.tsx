import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Search, HelpCircle, MessageSquare } from 'lucide-react';
import { PREGUNTAS_FRECUENTES } from '@/data/contenido';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(PREGUNTAS_FRECUENTES.map((f) => f.category)));
    return ['Todas', ...cats];
  }, []);

  const filteredFaqs = useMemo(() => {
    return PREGUNTAS_FRECUENTES.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Todas' || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  // Generate dynamic JSON-LD FAQPage schema for SEO
  useEffect(() => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: PREGUNTAS_FRECUENTES.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };

    let scriptTag = document.getElementById('faq-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'faq-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(faqSchema);

    return () => {
      const tag = document.getElementById('faq-jsonld');
      if (tag) tag.remove();
    };
  }, []);

  return (
    <section id="faqs" className="py-24 bg-[#F8FAFC] border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2B5C94] mb-3">
            <span className="w-5 h-0.5 bg-[#2B5C94]" />
            <span>Resolución de Dudas Comerciales y Técnicas</span>
            <span className="w-5 h-0.5 bg-[#2B5C94]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14233c] tracking-tight mb-4 text-balance">
            Preguntas Frecuentes
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Conoce todo sobre nuestros procesos de contratación, tiempos de entrega, cobertura y
            soporte técnico especializado.
          </p>
        </div>

        {/* Live Search and Category Filter */}
        <div className="mb-10 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por palabra clave (ej. garantía, entrega, factura, laptops)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B5C94] focus:border-transparent shadow-sm text-sm"
              aria-label="Buscar en preguntas frecuentes"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#233A5E] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl bg-white overflow-hidden transition-all duration-200 ${
                    isOpen
                      ? 'border-[#2B5C94]/40 shadow-md ring-1 ring-[#2B5C94]/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B5C94]"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <div className="flex items-start sm:items-center gap-3 pr-4">
                      <HelpCircle
                        className={`w-5 h-5 shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                          isOpen ? 'text-[#2B5C94]' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`p-1.5 rounded-full bg-slate-100 text-slate-600 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-[#2B5C94]/10 text-[#2B5C94]' : ''
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 bg-slate-50/40"
                    >
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-semibold mb-1">
                No encontramos preguntas que coincidan con tu búsqueda.
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Puedes escribirnos directamente por WhatsApp para atender tu consulta al instante.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todas');
                }}
                className="text-xs font-bold text-[#2B5C94] hover:underline"
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
