import { useEffect, useState } from 'react';
import { SITE } from './config/site';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { StatsSection } from './components/StatsSection';
import { PartnersSection } from './components/PartnersSection';
import { ClientsSection } from './components/ClientsSection';
import { FAQSection } from './components/FAQSection';
import { QuoteSection } from './components/QuoteSection';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { Footer } from './components/Footer';
import { useReveal } from './hooks/useReveal';

export default function App() {
  const [openService, setOpenService] = useState('pantallas-led');
  const [quoteService, setQuoteService] = useState('pantallas-led');

  useReveal();

  // Mantiene el canonical alineado con VITE_SITE_URL (también en el build).
  useEffect(() => {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${SITE.url.replace(/\/$/, '')}/`;
  }, []);

  const goToQuote = (serviceId?: string) => {
    if (serviceId) setQuoteService(serviceId);
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  /** Abre un servicio y, si ya estaba abierto, lo contrae. */
  const toggleService = (id: string) =>
    setOpenService((current) => (current === id ? '' : id));

  return (
    <div className="min-h-[100svh] bg-ground text-ink">
      <Navbar onQuote={() => goToQuote()} />

      <main>
        <Hero onQuote={() => goToQuote()} />
        <ServicesSection openId={openService} onToggle={toggleService} onQuote={goToQuote} />
        <AboutSection />
        <StatsSection />
        <PartnersSection />
        <ClientsSection />
        <FAQSection />
        <QuoteSection preselectedServiceId={quoteService} />
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
