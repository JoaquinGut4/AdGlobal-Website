import { useState } from 'react';
import type { FormEvent } from 'react';
import { Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { TicketArea, TicketPrioridad } from '@/types';

export interface NuevoTicketInput {
  area: TicketArea;
  equipo: string;
  cliente: string;
  prioridad: TicketPrioridad;
  descripcion: string;
  tecnico: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NuevoTicketInput) => void;
}

const TECNICOS = [
  'Ing. Carlos Mendoza (Taller Central)',
  'Téc. Miguel Alva (Soporte Campo)',
  'Téc. Fernando Ruiz (Audio LAB)',
  'Ing. Roberto Quispe (Redes & Servidores)',
];

const AREAS: { value: TicketArea; label: string }[] = [
  { value: 'Reparación Taller', label: 'Reparación en Taller Central (Hardware / Falla)' },
  { value: 'Soporte In-Situ', label: 'Soporte In-Situ / Campo (Evento o Sede de Cliente)' },
  {
    value: 'Mantenimiento Preventivo',
    label: 'Mantenimiento Preventivo y Limpieza Técnica',
  },
  { value: 'Cambio Express', label: 'Cambio Express de Equipo por SLA Activo' },
];

const PRIORIDADES: { value: TicketPrioridad; label: string }[] = [
  { value: 'Urgente', label: 'Urgente (SLA 24/7 Crítico)' },
  { value: 'Alta', label: 'Alta (Respuesta < 4 horas)' },
  { value: 'Media', label: 'Media (Atención estándar)' },
  { value: 'Baja', label: 'Baja (Programable)' },
];

const FIELD_CLASS =
  'w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2B5C94] bg-white font-medium';

export function TicketModal({ isOpen, onClose, onCreate }: TicketModalProps) {
  const [area, setArea] = useState<TicketArea>('Reparación Taller');
  const [cliente, setCliente] = useState('');
  const [prioridad, setPrioridad] = useState<TicketPrioridad>('Alta');
  const [equipo, setEquipo] = useState('');
  const [tecnico, setTecnico] = useState(TECNICOS[0]);
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!equipo.trim() || !cliente.trim() || !descripcion.trim()) return;

    onCreate({
      area,
      cliente: cliente.trim(),
      prioridad,
      equipo: equipo.trim(),
      tecnico,
      descripcion: descripcion.trim(),
    });

    setEquipo('');
    setCliente('');
    setDescripcion('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="ticket-modal-title"
      title="Aperturar Ticket de Soporte / Reparación"
      subtitle="Área técnica, servicio in-situ y taller de diagnóstico"
      icon={<Wrench className="w-4 h-4" />}
      headerClass="bg-slate-900"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Área de Atención Técnica
          </label>
          <select
            value={area}
            onChange={(event) => setArea(event.target.value as TicketArea)}
            className={FIELD_CLASS}
          >
            {AREAS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Cliente / Empresa *
            </label>
            <input
              type="text"
              required
              value={cliente}
              onChange={(event) => setCliente(event.target.value)}
              placeholder="Ej. Banco de Crédito BCP"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Prioridad de Atención
            </label>
            <select
              value={prioridad}
              onChange={(event) => setPrioridad(event.target.value as TicketPrioridad)}
              className={FIELD_CLASS}
            >
              {PRIORIDADES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Equipo Afectado / Serie / Modelo *
          </label>
          <input
            type="text"
            required
            value={equipo}
            onChange={(event) => setEquipo(event.target.value)}
            placeholder="Ej. Laptop ThinkPad T14 / Pantalla LED P2.6 Módulo 4"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Técnico Asignado
          </label>
          <select
            value={tecnico}
            onChange={(event) => setTecnico(event.target.value)}
            className={FIELD_CLASS}
          >
            {TECNICOS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Descripción del Problema o Solicitud Técnica *
          </label>
          <textarea
            rows={3}
            required
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Detalla la falla encontrada, síntomas, daños visibles o requerimiento de soporte..."
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
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Aperturar Ticket Ahora</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
