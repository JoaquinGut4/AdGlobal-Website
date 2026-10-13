import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export const WhatsAppFloat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '51957586421';
  const defaultMessage = 'Hola AD GLOBAL, deseo cotizar equipos para un evento/proyecto.';

  const handleQuickChat = (customText?: string) => {
    const textToSend = customText || defaultMessage;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Mini chat popup */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 text-slate-800">
          {/* Header */}
          <div className="bg-[#233A5E] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow">
                  AD
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#233A5E] rounded-full" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">AD GLOBAL Soporte</p>
                <p className="text-[11px] text-emerald-300">Respuesta promedio &lt; 5 min</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar chat flotante"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50 space-y-3 text-xs">
            <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-slate-200 text-slate-700 leading-relaxed">
              👋 ¡Hola! ¿En qué podemos ayudarte hoy? Elige una opción rápida o escribe directamente a nuestro asesor comercial:
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleQuickChat('Hola AD GLOBAL, requiero cotizar pantallas LED gigantes para un evento.')}
                className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-blue-50 hover:text-[#2B5C94] border border-slate-200 font-medium text-slate-700 transition-colors flex items-center justify-between group"
              >
                <span>🖥️ Cotizar Pantallas LED</span>
                <Send className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => handleQuickChat('Hola AD GLOBAL, necesito alquilar una flota de laptops corporativas.')}
                className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-blue-50 hover:text-[#2B5C94] border border-slate-200 font-medium text-slate-700 transition-colors flex items-center justify-between group"
              >
                <span>💻 Cotizar Laptops & Cómputo</span>
                <Send className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => handleQuickChat('Hola AD GLOBAL, necesito impresoras multifuncionales o tóner corporativo.')}
                className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-blue-50 hover:text-[#2B5C94] border border-slate-200 font-medium text-slate-700 transition-colors flex items-center justify-between group"
              >
                <span>🖨️ Impresoras Multifuncionales</span>
                <Send className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Footer Direct CTA */}
          <div className="p-3 bg-white border-t border-slate-200">
            <button
              onClick={() => handleQuickChat()}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Abrir WhatsApp Web / App</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 relative cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-400 border-2 border-white rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-400 border-2 border-white rounded-full" />
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
};
