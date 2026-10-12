import React, { useState, useEffect } from 'react';
import {
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { SERVICIOS_DATA } from '@/data/servicios';
import { CONTACTO_INFO } from '@/data/contenido';
import { SITE, whatsappLink } from '@/config/site';

interface QuoteSectionProps {
  preselectedServiceId?: string;
}

interface FormState {
  nombre: string;
  empresa: string;
  correo: string;
  telefono: string;
  servicioId: string;
  fechas: string;
  ciudad: string;
  mensaje: string;
}

interface FormErrors {
  nombre?: string;
  empresa?: string;
  correo?: string;
  telefono?: string;
  servicioId?: string;
  ciudad?: string;
  mensaje?: string;
}

const buildWhatsAppMessage = (data: FormState): string => {
  const serviceTitle = SERVICIOS_DATA.find((s) => s.id === data.servicioId)?.title ?? data.servicioId;
  const lines = [
    '*Solicitud de Cotización - AD GLOBAL*',
    '',
    `*Nombre:* ${data.nombre}`,
    `*Empresa / RUC:* ${data.empresa}`,
    `*Correo:* ${data.correo}`,
    `*Teléfono:* ${data.telefono}`,
    `*Servicio:* ${serviceTitle}`,
    `*Ciudad / Región:* ${data.ciudad}`,
  ];
  if (data.fechas.trim()) lines.push(`*Fechas / Duración:* ${data.fechas}`);
  lines.push('', `*Detalles:* ${data.mensaje}`);
  return lines.join('\n');
};

export const QuoteSection: React.FC<QuoteSectionProps> = ({ preselectedServiceId }) => {
  const [formData, setFormData] = useState<FormState>({
    nombre: '',
    empresa: '',
    correo: '',
    telefono: '',
    servicioId: preselectedServiceId || 'pantallas-led',
    fechas: '',
    ciudad: 'Lima',
    mensaje: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [submittedData, setSubmittedData] = useState<FormState | null>(null);

  // Sync when preselectedServiceId changes externally
  useEffect(() => {
    if (preselectedServiceId) {
      setFormData((prev) => ({ ...prev, servicioId: preselectedServiceId }));
    }
  }, [preselectedServiceId]);

  const validate = (data: FormState): FormErrors => {
    const errs: FormErrors = {};
    if (!data.nombre.trim()) errs.nombre = 'El nombre completo es requerido';
    if (!data.empresa.trim()) errs.empresa = 'El nombre o RUC de la empresa es requerido';
    if (!data.correo.trim()) {
      errs.correo = 'El correo electrónico corporativo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) {
      errs.correo = 'Ingresa un correo electrónico válido (ej. contacto@empresa.com)';
    }
    if (!data.telefono.trim()) {
      errs.telefono = 'El teléfono de contacto es requerido';
    } else if (data.telefono.replace(/\D/g, '').length < 7) {
      errs.telefono = 'Ingresa un número telefónico válido (mínimo 7 dígitos)';
    }
    if (!data.servicioId) errs.servicioId = 'Selecciona un servicio';
    if (!data.ciudad.trim()) errs.ciudad = 'Indica la ciudad del evento o proyecto';
    if (!data.mensaje.trim() || data.mensaje.length < 10) {
      errs.mensaje = 'Por favor describe brevemente tus requerimientos (mínimo 10 caracteres)';
    }
    return errs;
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(formData));
  };

  const handleChange = (field: keyof FormState, value: string) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (touched[field]) {
      setErrors(validate(next));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Open WhatsApp with the quote details pre-filled
      window.open(
        whatsappLink(buildWhatsAppMessage(formData)),
        '_blank',
        'noopener,noreferrer'
      );
      setSubmittedData({ ...formData });
    }
  };

  const resetForm = () => {
    setSubmittedData(null);
    setFormData({
      nombre: '',
      empresa: '',
      correo: '',
      telefono: '',
      servicioId: 'pantallas-led',
      fechas: '',
      ciudad: 'Lima',
      mensaje: '',
    });
    setTouched({});
    setErrors({});
  };

  const selectedSubmittedService = submittedData
    ? SERVICIOS_DATA.find((s) => s.id === submittedData.servicioId)
    : undefined;

  const inputClass = (field: keyof FormState) =>
    `w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
      touched[field] && errors[field as keyof FormErrors]
        ? 'border-rose-500 focus:ring-rose-400'
        : 'border-white/15 focus:ring-sky-400 focus:border-transparent'
    }`;

  const renderError = (field: keyof FormState) =>
    touched[field] && errors[field as keyof FormErrors] ? (
      <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" />
        {errors[field as keyof FormErrors]}
      </p>
    ) : null;

  return (
    <section id="contacto" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2B5C94] rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#162947] rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">
            <span className="w-5 h-0.5 bg-sky-400" />
            <span>Atención Inmediata</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 text-balance">
            Panel de Cotización y Contacto
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Completa tus datos y enviaremos tu solicitud directamente a nuestro WhatsApp. Recibe
            una propuesta técnica-comercial formal en menos de 2 horas. Asesoría directa para
            Lima, provincias y proyectos internacionales.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Interactive Form */}
          <div className="lg:col-span-7 bg-[#132034] rounded-2xl p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col justify-between">
            {submittedData ? (
              /* Success Screen */
              <div className="text-center py-8 my-auto space-y-6 animate-in fade-in duration-300 flex-1 flex flex-col justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    ¡Solicitud Lista para Enviar!
                  </h3>
                  <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                    Estimado/a <strong className="text-white">{submittedData.nombre}</strong> de{' '}
                    <strong className="text-white">{submittedData.empresa}</strong>, hemos abierto
                    WhatsApp con los detalles de tu requerimiento para{' '}
                    <strong className="text-sky-300">{selectedSubmittedService?.title}</strong>. Si
                    no se abrió automáticamente, usa el botón de abajo.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left text-xs space-y-2 max-w-md mx-auto font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destino/Ciudad:</span>
                    <span className="text-white">{submittedData.ciudad}</span>
                  </div>
                  {submittedData.fechas && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fechas tentativas:</span>
                      <span className="text-white">{submittedData.fechas}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Canal de respuesta:</span>
                    <span className="text-white">{submittedData.correo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tiempo estimado:</span>
                    <span className="text-emerald-400 font-bold">&lt; 2 horas</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <a
                    href={whatsappLink(buildWhatsAppMessage(submittedData))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white transition-colors"
                  >
                    <span>Abrir WhatsApp ({SITE.phoneDisplay})</span>
                  </a>

                  <button
                    onClick={resetForm}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold text-white transition-colors"
                  >
                    Nueva cotización
                  </button>
                </div>
              </div>
            ) : (
              /* Actual Form */
              <form
                onSubmit={handleSubmit}
                className="space-y-6 sm:space-y-7 flex-1 flex flex-col justify-between"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Nombre */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Nombre Completo <span className="text-sky-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      onBlur={() => handleBlur('nombre')}
                      placeholder="Ej. Carlos Mendoza"
                      className={inputClass('nombre')}
                    />
                    {renderError('nombre')}
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Empresa / Institución / RUC <span className="text-sky-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.empresa}
                      onChange={(e) => handleChange('empresa', e.target.value)}
                      onBlur={() => handleBlur('empresa')}
                      placeholder="Ej. Minera Sur SAC / 20601234567"
                      className={inputClass('empresa')}
                    />
                    {renderError('empresa')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Correo */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Correo Corporativo <span className="text-sky-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.correo}
                      onChange={(e) => handleChange('correo', e.target.value)}
                      onBlur={() => handleBlur('correo')}
                      placeholder="contacto@tuempresa.com"
                      className={inputClass('correo')}
                    />
                    {renderError('correo')}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Teléfono / WhatsApp Móvil <span className="text-sky-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      onBlur={() => handleBlur('telefono')}
                      placeholder="+51 908838291"
                      className={inputClass('telefono')}
                    />
                    {renderError('telefono')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Servicio de interés */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Servicio de Interés <span className="text-sky-400">*</span>
                    </label>
                    <select
                      value={formData.servicioId}
                      onChange={(e) => handleChange('servicioId', e.target.value)}
                      onBlur={() => handleBlur('servicioId')}
                      className="w-full px-4 py-3 rounded-xl bg-[#1a2d48] border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                    >
                      {SERVICIOS_DATA.map((srv) => (
                        <option key={srv.id} value={srv.id} className="bg-[#101b2c] text-white">
                          {srv.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Ciudad / Región <span className="text-sky-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => handleChange('ciudad', e.target.value)}
                      onBlur={() => handleBlur('ciudad')}
                      placeholder="Lima, Arequipa, etc."
                      className={inputClass('ciudad')}
                    />
                    {renderError('ciudad')}
                  </div>
                </div>

                {/* Fechas tentativas */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Fechas tentativas del evento o duración del alquiler
                  </label>
                  <input
                    type="text"
                    value={formData.fechas}
                    onChange={(e) => handleChange('fechas', e.target.value)}
                    placeholder="Ej. Del 15 al 18 de Noviembre (4 días) o Alquiler mensual de 3 meses"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                {/* Mensaje */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Detalles del Requerimiento Técnico <span className="text-sky-400">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={formData.mensaje}
                    onChange={(e) => handleChange('mensaje', e.target.value)}
                    onBlur={() => handleBlur('mensaje')}
                    placeholder="Indica cantidades aproximadas (ej. 20 laptops Core i7, 1 pantalla LED, tablets, consolas de audio), especificaciones de software, o requerimientos especiales de instalación..."
                    className={`${inputClass('mensaje')} flex-1 min-h-[140px] py-3.5`}
                  />
                  {renderError('mensaje')}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl font-bold text-white bg-[#2B5C94] hover:bg-[#346db0] active:scale-[0.99] transition-all duration-200 shadow-xl shadow-[#2B5C94]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enviar por WhatsApp</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Data & Social Networks */}
          <div className="lg:col-span-5 space-y-8">
            {/* Direct Contact Card */}
            <div className="bg-[#14233c] rounded-2xl p-7 border border-white/10 space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight pb-3 border-b border-white/10">
                Canales de Atención Directa
              </h3>

              {/* Central y Teléfonos */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Teléfonos de Contacto
                </p>
                <div className="space-y-2 font-mono text-sm">
                  {CONTACTO_INFO.phones.map((phone, i) => (
                    <a
                      key={i}
                      href={
                        phone.isWhatsApp
                          ? whatsappLink('Hola AD GLOBAL, deseo más información.')
                          : `tel:${phone.raw}`
                      }
                      target={phone.isWhatsApp ? '_blank' : undefined}
                      rel={phone.isWhatsApp ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-sky-400" />
                        <span className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                          {phone.display}
                        </span>
                      </div>
                      {phone.isWhatsApp && (
                        <span className="text-[11px] font-sans font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                          WhatsApp
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>

              {/* Correo electrónico */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Correo Electrónico
                </p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-sky-300 font-mono transition-colors"
                >
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>{SITE.email}</span>
                </a>
              </div>

              {/* Dirección */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Oficina Principal
                </p>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">{CONTACTO_INFO.address.full}</p>
                </div>
              </div>

              {/* Horario de Atención */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Horarios y Guardias Técnicas
                </p>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{CONTACTO_INFO.schedule.weekdays}</span>
                  </div>
                  <div className="text-slate-400 pl-5">{CONTACTO_INFO.schedule.saturdays}</div>
                  {CONTACTO_INFO.schedule.emergencies && (
                    <div className="text-slate-400 pl-5">
                      {CONTACTO_INFO.schedule.emergencies}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="bg-[#14233c] rounded-2xl p-7 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-sky-400" />
                  <span>Síguenos en Redes Sociales</span>
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <a
                  href={CONTACTO_INFO.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40 border border-white/5 text-xs font-bold text-slate-200 hover:text-white transition-all"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={CONTACTO_INFO.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-[#E4405F]/20 hover:border-[#E4405F]/40 border border-white/5 text-xs font-bold text-slate-200 hover:text-white transition-all"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={CONTACTO_INFO.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/40 border border-white/5 text-xs font-bold text-slate-200 hover:text-white transition-all"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={CONTACTO_INFO.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-slate-700/40 hover:border-slate-500 border border-white/5 text-xs font-bold text-slate-200 hover:text-white transition-all"
                >
                  <span>TikTok</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
