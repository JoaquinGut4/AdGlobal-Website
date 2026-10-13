import { CLIENTES_DATA } from '@/data/clientes';

const RATING_CLASSES: Record<string, string> = {
  VIP: 'bg-sky-100 text-sky-800',
  'A+': 'bg-emerald-100 text-emerald-800',
  Estándar: 'bg-slate-100 text-slate-600',
};

export function ClientesPage() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Directorio de Clientes Corporativos
        </h2>
        <p className="text-xs text-slate-500">
          Historial de cuentas recurrentes en minería, banca, telecomunicaciones y eventos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {CLIENTES_DATA.map((cliente) => (
          <div
            key={cliente.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-800">{cliente.name}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  RATING_CLASSES[cliente.rating] ?? RATING_CLASSES.Estándar
                }`}
              >
                {cliente.rating}
              </span>
            </div>
            <p className="text-xs text-slate-500">{cliente.sector}</p>
            <p className="text-xs font-semibold text-[#2B5C94]">
              {cliente.eventos} proyectos completados
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
