import { useState } from 'react';
import type { FormEvent } from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SERVICIOS_DATA } from '@/data/servicios';

export interface NuevaCotizacionInput {
  empresa: string;
  nombre: string;
  correo: string;
  telefono: string;
  servicioId: string;
  ciudad: string;
  fechas: string;
  mensaje: string;
}

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NuevaCotizacionInput) => void;
}

const FIELD_CLASS =
  'w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94] bg-white font-medium';

export function QuoteModal({ isOpen, onClose, onCreate }: QuoteModalProps) {
  const [empresa, setEmpresa] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicioId, setServicioId] = useState(SERVICIOS_DATA[0].id);
  const [ciudad, setCiudad] = useState('Lima');
  const [fechas, setFechas] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!empresa.trim() || !nombre.trim() || !correo.trim()) return;

    onCreate({
      empresa: empresa.trim(),
      nombre: nombre.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
      servicioId,
      ciudad: ciudad.trim(),
      fechas: fechas.trim(),
      mensaje: mensaje.trim(),
    });

    setEmpresa('');
    setNombre('');
    setCorreo('');
    setTelefono('');
    setFechas('');
    setMensaje('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="quote-modal-title"
      title="Aperturar Cotización"
      subtitle="Registro de cotización comercial para eventos o alquiler corporativo"
      icon={<FileText className="w-4 h-4" />}
      headerClass="bg-[#2B5C94]"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Empresa / Razón Social *
            </label>
            <input
              type="text"
              required
              value={empresa}
              onChange={(event) => setEmpresa(event.target.value)}
              placeholder="Ej. Interbank / Belcorp SAC"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Contacto Responsable *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej. Andrea Morales"
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Email Corporativo *
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              placeholder="contacto@empresa.pe"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Teléfono / WhatsApp
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(event) => setTelefono(event.target.value)}
              placeholder="+51 987 654 321"
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Servicio Requerido
            </label>
            <select
              value={servicioId}
              onChange={(event) => setServicioId(event.target.value)}
              className={FIELD_CLASS}
            >
              {SERVICIOS_DATA.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Ciudad / Sede
            </label>
            <input
              type="text"
              value={ciudad}
              onChange={(event) => setCiudad(event.target.value)}
              placeholder="Lima / Arequipa / Trujillo..."
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Fechas Tentativas del Alquiler / Evento
          </label>
          <input
            type="text"
            value={fechas}
            onChange={(event) => setFechas(event.target.value)}
            placeholder="Ej. Del 10 al 14 de Noviembre (4 días)"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Detalle del Requerimiento / Cantidades de Equipos
          </label>
          <textarea
            rows={3}
            value={mensaje}
            onChange={(event) => setMensaje(event.target.value)}
            placeholder="Especifica modelos, cantidades, configuraciones o requerimientos técnicos..."
            className={FIELD_CLASS}
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2B5C94] hover:bg-[#1F4778] transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Aperturar Cotización</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
