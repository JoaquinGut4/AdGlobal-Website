import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { ExperienceSection } from './components/ExperienceSection';
import { FAQSection } from './components/FAQSection';
import { ClientsMarquee } from './components/ClientsMarquee';
import { QuoteSection } from './components/QuoteSection';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { Footer } from './components/Footer';

export default function App() {
  const [selectedQuoteService, setSelectedQuoteService] = useState<string>('pantallas-led');

  const handleOpenQuote = (serviceId?: string) => {
    if (serviceId) {
      setSelectedQuoteService(serviceId);
    }
    const quoteElement = document.getElementById('contacto');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceFromFooter = (serviceId: string) => {
    setSelectedQuoteService(serviceId);
    const servicesSection = document.getElementById('servicios');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#2B5C94] selection:text-white">
      {/* 0. Header / Navbar */}
      <Navbar onOpenQuote={handleOpenQuote} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Banner Hero */}
        <Hero onOpenQuote={() => handleOpenQuote()} />

        {/* 2. Nuestros Servicios (interactiva con galería & modal) */}
        <ServicesSection onQuoteService={handleOpenQuote} />

        {/* 3. Experiencia (estadísticas interactivas con contadores animados) */}
        <ExperienceSection />

        {/* 4. Preguntas Frecuentes (acordeón accesible, buscador y JSON-LD) */}
        <FAQSection />

        {/* 5. Nuestros Clientes (carrusel infinito automático) */}
        <ClientsMarquee />

        {/* 6. Panel de Cotizar + Redes Sociales */}
        <QuoteSection preselectedServiceId={selectedQuoteService} />
      </main>

      {/* Floating WhatsApp Button */}
      <WhatsAppFloat />

      {/* 7. Footer */}
      <Footer onSelectService={handleSelectServiceFromFooter} />
    </div>
  );
}
