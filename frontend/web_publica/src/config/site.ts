/**
 * Configuración central del sitio público.
 * Los valores se leen de variables de entorno (Vite) con fallbacks seguros.
 * Todas las variables deben empezar con VITE_ para estar disponibles en el cliente.
 */

export const SITE = {
  url: import.meta.env.VITE_SITE_URL ?? 'https://adglobalperu.com',
  adminUrl:
    import.meta.env.VITE_ADMIN_URL ??
    (import.meta.env.DEV ? 'http://localhost:3001' : '/panel_admin/'),
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '51908838291',
  phoneDisplay: import.meta.env.VITE_CONTACT_PHONE_DISPLAY ?? '+51 908 838 291',
  email: import.meta.env.VITE_CONTACT_EMAIL ?? 'atencionalcliente@adglobalperu.com',
  /** URL base del backend (fase 2). Vacío = no se usa todavía. */
  apiUrl: import.meta.env.VITE_API_URL ?? '',
} as const;

/** Construye un enlace de WhatsApp con un mensaje pre-cargado. */
export const whatsappLink = (message: string, phone: string = SITE.whatsappNumber): string => {
  // WhatsApp requiere SOLO dígitos con código de país: sin "+", espacios ni guiones.
  const onlyDigits = phone.replace(/\D+/g, '');
  return `https://wa.me/${onlyDigits}?text=${encodeURIComponent(message)}`;
};
