import React, { useState, useEffect } from 'react';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { ExperienceSection } from './components/ExperienceSection';
import { FAQSection } from './components/FAQSection';
import { ClientsMarquee } from './components/ClientsMarquee';
import { QuoteSection } from './components/QuoteSection';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { Footer } from './components/Footer';
import { AdminPage } from './components/AdminPage';
import { SectionsDrawer } from './components/SectionsDrawer';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'admin'>(() => {
    return window.location.hash === '#admin' ? 'admin' : 'home';
  });
  const [selectedQuoteService, setSelectedQuoteService] = useState<string>('pantallas-led');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateToAdmin = () => {
    window.location.hash = '#admin';
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    window.location.hash = '';
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToSection = (sectionId: string) => {
    if (currentView === 'admin') {
      handleBackToHome();
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  const handleOpenQuote = (serviceId?: string) => {
    if (currentView === 'admin') {
      handleBackToHome();
    }
    if (serviceId) {
      setSelectedQuoteService(serviceId);
    }
    setTimeout(() => {
      const quoteElement = document.getElementById('contacto');
      if (quoteElement) {
        quoteElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleSelectServiceFromFooter = (serviceId: string) => {
    setSelectedQuoteService(serviceId);
    const servicesSection = document.getElementById('servicios');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If viewing Admin Page, render dedicated view
  if (currentView === 'admin') {
    return <AdminPage onBackToHome={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#2B5C94] selection:text-white">
      {/* 0. Header / Navbar con botón de cotizar, acceso admin y panel deslizable de apartados */}
      <Navbar
        onOpenQuote={handleOpenQuote}
        onOpenAdminLogin={handleNavigateToAdmin}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Banner Hero */}
        <Hero onOpenQuote={() => handleOpenQuote()} />

        {/* 2. Nuestros Servicios (interactiva con galería & modal) */}
        <ServicesSection onQuoteService={handleOpenQuote} />

        {/* 3. Experiencia (estadísticas interactivas con contadores animados y carrusel) */}
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

      {/* 7. Footer fielmente reproducido de la imagen del cliente */}
      <Footer onSelectService={handleSelectServiceFromFooter} />

      {/* 8. Panel Deslizable Lateral para explorar todos los apartados creados y futuros */}
      <SectionsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigateToSection={handleNavigateToSection}
        onOpenAdmin={handleNavigateToAdmin}
        onSelectServiceModal={(serviceId) => {
          handleSelectServiceFromFooter(serviceId);
        }}
      />
    </div>
  );
}
