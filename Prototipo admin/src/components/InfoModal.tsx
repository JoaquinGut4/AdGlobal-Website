import React from 'react';
import { X, Shield, FileText, Building } from 'lucide-react';

interface InfoModalProps {
  type: 'about' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const getContent = () => {
    switch (type) {
      case 'about':
        return {
          title: 'Acerca de AD GLOBAL',
          icon: <Building className="w-6 h-6 text-sky-400" />,
          body: (
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                <strong>AD GLOBAL</strong> es una empresa peruana especializada en la provisión, alquiler, venta y soporte integral de infraestructura tecnológica de última generación para el sector corporativo, institucional y de eventos masivos.
              </p>
              <p>
                Con más de 12 años de trayectoria y presencia en las 24 regiones del Perú, contamos con un parque tecnológico propio que supera los 15,000 equipos activos: pantallas LED de curvatura variable y pitch fino, flotas de laptops de alto rendimiento, centros de cómputo temporal, impresoras multifuncionales láser de alta demanda y desarrollo de software para eventos.
              </p>
              <h4 className="font-bold text-slate-800 pt-2">Nuestra Promesa de Servicio</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cero fallas: Equipos de reemplazo en caliente (hot-swap) incluidos en cada despacho.</li>
                <li>Operadores y técnicos de guardia presencial durante congresos y cumbres.</li>
                <li>Puntualidad logística estricta con entregas en 24 a 48 horas en todo el país.</li>
              </ul>
            </div>
          )
        };
      case 'privacy':
        return {
          title: 'Política de Privacidad',
          icon: <Shield className="w-6 h-6 text-emerald-500" />,
          body: (
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                En cumplimiento de la <strong>Ley N° 29733 (Ley de Protección de Datos Personales de la República del Perú)</strong> y su reglamento, AD GLOBAL garantiza la total confidencialidad y adecuado tratamiento de los datos personales suministrados por nuestros clientes y cotizantes.
              </p>
              <h4 className="font-bold text-slate-800 pt-2">Finalidad del Tratamiento</h4>
              <p>
                Los datos recolectados a través de nuestros formularios (nombre, razón social, correo, teléfono) se utilizan exclusivamente para:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Elaboración y envío de cotizaciones comerciales solicitadas.</li>
                <li>Coordinaciones logísticas de despacho y retiro de equipamiento.</li>
                <li>Emisión de comprobantes de pago electrónicos y contratos de arrendamiento.</li>
              </ul>
              <p>
                AD GLOBAL no comercializa, transfiere ni cede bajo ninguna circunstancia bases de datos a terceros. Puede solicitar la rectificación o supresión de sus datos en cualquier momento escribiendo a <span className="font-mono text-sky-600">atencionalcliente@adglobalperu.com</span>.
              </p>
            </div>
          )
        };
      case 'terms':
        return {
          title: 'Términos y Condiciones de Servicio',
          icon: <FileText className="w-6 h-6 text-blue-500" />,
          body: (
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                El arrendamiento de equipos tecnológicos con <strong>AD GLOBAL</strong> se rige bajo las siguientes estipulaciones comerciales y operativas:
              </p>
              <h4 className="font-bold text-slate-800 pt-2">1. Entrega y Recepción</h4>
              <p>
                Los equipos se entregan con acta de conformidad, pruebas operativas de encendido y verificación de accesorios. El cliente designa a un representante acreditado para la firma de entrega.
              </p>
              <h4 className="font-bold text-slate-800 pt-2">2. Garantía y Continuidad Operativa</h4>
              <p>
                AD GLOBAL asume el mantenimiento correctivo y la sustitución inmediata de cualquier equipo que presente fallas de fábrica durante el plazo del alquiler sin costo adicional.
              </p>
              <h4 className="font-bold text-slate-800 pt-2">3. Facturación</h4>
              <p>
                Los comprobantes se emiten en Soles (PEN) o Dólares Americanos (USD) según el acuerdo comercial cotizado, sujetos a las detracciones de ley vigentes por concepto de arrendamiento de bienes muebles.
              </p>
            </div>
          )
        };
    }
  };

  const content = getContent();

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100">
              {content.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{content.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {content.body}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#233A5E] text-white text-xs font-bold hover:bg-[#1b2d49] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
