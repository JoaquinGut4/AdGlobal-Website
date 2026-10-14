import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { SERVICIOS_DATA } from '@/data/servicios';
import { CONTACTO_INFO } from '@/data/contenido';
import { SITE, whatsappLink } from '@/config/site';
import contactBg from '@/assets/servicios/pantallas-led/PantallasLED 1.jpeg';

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

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  nombre: '',
  empresa: '',
  correo: '',
  telefono: '',
  servicioId: 'pantallas-led',
  fechas: '',
  ciudad: 'Lima',
  mensaje: '',
};

const buildWhatsAppMessage = (data: FormState): string => {
  const serviceTitle =
    SERVICIOS_DATA.find((service) => service.id === data.servicioId)?.title ?? data.servicioId;
  const lines = [
    '*Solicitud de cotización · AD GLOBAL*',
    '',
    `*Nombre:* ${data.nombre}`,
    `*Empresa / RUC:* ${data.empresa}`,
    `*Correo:* ${data.correo}`,
    `*Teléfono:* ${data.telefono}`,
    `*Servicio:* ${serviceTitle}`,
    `*Ciudad:* ${data.ciudad}`,
  ];
  if (data.fechas.trim()) lines.push(`*Fechas:* ${data.fechas}`);
  lines.push('', `*Detalles:* ${data.mensaje}`);
  return lines.join('\n');
};

const SOCIAL = [
  { label: 'Facebook', href: CONTACTO_INFO.social.facebook },
  { label: 'Instagram', href: CONTACTO_INFO.social.instagram },
  { label: 'LinkedIn', href: CONTACTO_INFO.social.linkedin },
  { label: 'TikTok', href: CONTACTO_INFO.social.tiktok },
];

export const QuoteSection: React.FC<QuoteSectionProps> = ({ preselectedServiceId }) => {
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitted, setSubmitted] = useState<FormState | null>(null);

  useEffect(() => {
    if (preselectedServiceId) {
      setFormData((prev) => ({ ...prev, servicioId: preselectedServiceId }));
    }
  }, [preselectedServiceId]);

  const validate = (data: FormState): FormErrors => {
    const next: FormErrors = {};
    if (!data.nombre.trim()) next.nombre = 'Escribe tu nombre completo.';
    if (!data.empresa.trim()) next.empresa = 'Escribe la empresa o el RUC.';
    if (!data.correo.trim()) next.correo = 'Escribe tu correo corporativo.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo))
      next.correo = 'Ingresa un correo válido.';
    if (!data.telefono.trim()) next.telefono = 'Escribe un teléfono de contacto.';
    else if (data.telefono.replace(/\D/g, '').length < 7)
      next.telefono = 'Ingresa al menos 7 dígitos.';
    if (!data.ciudad.trim()) next.ciudad = 'Indica la ciudad del proyecto.';
    if (!data.mensaje.trim() || data.mensaje.length < 10)
      next.mensaje = 'Describe tus requerimientos (mínimo 10 caracteres).';
    return next;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (touched[field]) setErrors(validate(next));
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<string, boolean>
    );
    setTouched(allTouched);
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      window.open(
        whatsappLink(buildWhatsAppMessage(formData)),
        '_blank',
        'noopener,noreferrer'
      );
      setSubmitted({ ...formData });
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setFormData(EMPTY_FORM);
    setTouched({});
    setErrors({});
  };

  const submittedService = submitted
    ? SERVICIOS_DATA.find((service) => service.id === submitted.servicioId)
    : undefined;

  const fieldClass = (field: keyof FormState) =>
    `w-full rounded-[2px] border bg-ground-2 px-4 py-3 text-body text-ink placeholder:text-muted/60 transition-colors focus:border-transparent focus:outline-none focus:ring-2 ${
      touched[field] && errors[field]
        ? 'border-rose-500 focus:ring-rose-400'
        : 'border-line focus:ring-accent'
    }`;

  const fieldError = (field: keyof FormState) =>
    touched[field] && errors[field] ? (
      <p className="mt-2 flex items-center gap-1.5 text-small text-rose-400">
        <AlertCircle className="h-3.5 w-3.5" />
        {errors[field]}
      </p>
    ) : null;

  return (
    <section id="contacto" className="section relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={contactBg}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ground/88" />
      </div>

      <div className="wrap relative">
        <h2 className="heading mb-[clamp(2rem,4vw,3.5rem)] max-w-[16ch] text-ink" data-reveal>
          Pide tu cotización
        </h2>

        <div className="grid12 gap-y-8">
          {/* Panel de cotización */}
          <div className="panel col-span-12 p-[clamp(1.5rem,3vw,2.75rem)] lg:col-span-7">
            {submitted ? (
              <div className="flex flex-col items-start gap-6">
                <div className="flex items-center gap-3 text-accent">
                  <CheckCircle2 className="h-8 w-8" />
                  <h3 className="title text-ink">Solicitud lista para enviar</h3>
                </div>
                <p className="max-w-[52ch] text-body leading-relaxed text-muted">
                  {submitted.nombre} de {submitted.empresa}: abrimos WhatsApp con el detalle de tu
                  requerimiento de <span className="text-ink">{submittedService?.title}</span>. Si
                  no se abrió, usa el botón.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={whatsappLink(buildWhatsAppMessage(submitted))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary"
                  >
                    Abrir WhatsApp
                  </a>
                  <button onClick={resetForm} className="btn btn--ghost">
                    Nueva cotización
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid12 gap-y-6">
                  <div className="col-span-12 sm:col-span-6">
                    <label htmlFor="q-nombre" className="mb-2 block text-small text-muted">
                      Nombre completo
                    </label>
                    <input
                      id="q-nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      onBlur={() => handleBlur('nombre')}
                      placeholder="Carlos Mendoza"
                      className={fieldClass('nombre')}
                    />
                    {fieldError('nombre')}
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <label htmlFor="q-empresa" className="mb-2 block text-small text-muted">
                      Empresa o RUC
                    </label>
                    <input
                      id="q-empresa"
                      type="text"
                      value={formData.empresa}
                      onChange={(e) => handleChange('empresa', e.target.value)}
                      onBlur={() => handleBlur('empresa')}
                      placeholder="Minera Sur SAC · 20601234567"
                      className={fieldClass('empresa')}
                    />
                    {fieldError('empresa')}
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <label htmlFor="q-correo" className="mb-2 block text-small text-muted">
                      Correo corporativo
                    </label>
                    <input
                      id="q-correo"
                      type="email"
                      value={formData.correo}
                      onChange={(e) => handleChange('correo', e.target.value)}
                      onBlur={() => handleBlur('correo')}
                      placeholder="contacto@tuempresa.com"
                      className={fieldClass('correo')}
                    />
                    {fieldError('correo')}
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <label htmlFor="q-telefono" className="mb-2 block text-small text-muted">
                      Teléfono o WhatsApp
                    </label>
                    <input
                      id="q-telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      onBlur={() => handleBlur('telefono')}
                      placeholder="+51 900 000 000"
                      className={fieldClass('telefono')}
                    />
                    {fieldError('telefono')}
                  </div>

                  <div className="col-span-12 sm:col-span-7">
                    <label htmlFor="q-servicio" className="mb-2 block text-small text-muted">
                      Servicio de interés
                    </label>
                    <select
                      id="q-servicio"
                      value={formData.servicioId}
                      onChange={(e) => handleChange('servicioId', e.target.value)}
                      className="w-full cursor-pointer rounded-[2px] border border-line bg-ground-2 px-4 py-3 text-body text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {SERVICIOS_DATA.map((service) => (
                        <option key={service.id} value={service.id} className="bg-ground-2">
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-12 sm:col-span-5">
                    <label htmlFor="q-ciudad" className="mb-2 block text-small text-muted">
                      Ciudad
                    </label>
                    <input
                      id="q-ciudad"
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => handleChange('ciudad', e.target.value)}
                      onBlur={() => handleBlur('ciudad')}
                      placeholder="Lima"
                      className={fieldClass('ciudad')}
                    />
                    {fieldError('ciudad')}
                  </div>

                  <div className="col-span-12">
                    <label htmlFor="q-fechas" className="mb-2 block text-small text-muted">
                      Fechas o duración
                    </label>
                    <input
                      id="q-fechas"
                      type="text"
                      value={formData.fechas}
                      onChange={(e) => handleChange('fechas', e.target.value)}
                      placeholder="Del 15 al 18 de noviembre, o alquiler mensual"
                      className={fieldClass('fechas')}
                    />
                  </div>

                  <div className="col-span-12">
                    <label htmlFor="q-mensaje" className="mb-2 block text-small text-muted">
                      Detalles del requerimiento
                    </label>
                    <textarea
                      id="q-mensaje"
                      rows={4}
                      value={formData.mensaje}
                      onChange={(e) => handleChange('mensaje', e.target.value)}
                      onBlur={() => handleBlur('mensaje')}
                      placeholder="Cantidades y especificaciones: 20 laptops Core i7, 1 pantalla LED, tablets, consolas de audio…"
                      className={`${fieldClass('mensaje')} min-h-[120px] resize-y`}
                    />
                    {fieldError('mensaje')}
                  </div>
                </div>

                <button type="submit" className="btn btn--primary btn--full">
                  Enviar por WhatsApp
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          {/* Canal de atención */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-paper p-[clamp(1.5rem,3vw,2.5rem)] text-paper-ink">
              <h3 className="title">Canal de atención</h3>

              <div className="mt-7 space-y-5 text-body">
                <a
                  href={whatsappLink('Hola AD GLOBAL, deseo más información.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-paper-ink"
                >
                  <Phone className="h-5 w-5 shrink-0" />
                  <span className="figure">{SITE.phoneDisplay}</span>
                </a>

                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 break-all text-paper-ink"
                >
                  <Mail className="h-5 w-5 shrink-0" />
                  <span>{SITE.email}</span>
                </a>

                <p className="flex items-start gap-3 text-paper-muted">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{CONTACTO_INFO.address.full}</span>
                </p>

                <div className="text-paper-muted">
                  <p>{CONTACTO_INFO.schedule.weekdays}</p>
                  <p>{CONTACTO_INFO.schedule.saturdays}</p>
                </div>
              </div>

              <a
                href={whatsappLink('Hola AD GLOBAL, deseo cotizar equipos para un proyecto.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--dark btn--full mt-8"
              >
                Escribir por WhatsApp
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-small">
              {SOCIAL.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link text-muted"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
