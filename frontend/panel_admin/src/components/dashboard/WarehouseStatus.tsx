import { ESTADO_ALMACEN } from '@/data/analytics';

const COLOR_CLASSES: Record<string, { text: string; bar: string }> = {
  emerald: { text: 'text-emerald-600', bar: 'bg-emerald-500' },
  sky: { text: 'text-sky-600', bar: 'bg-sky-500' },
  purple: { text: 'text-purple-600', bar: 'bg-purple-500' },
};

export function WarehouseStatus() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
          Estado Operativo de Almacén
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Supervisión de parque informático listo para despacho
        </p>

        <div className="space-y-3">
          {ESTADO_ALMACEN.map((item) => {
            const colors = COLOR_CLASSES[item.color] ?? COLOR_CLASSES.sky;
            return (
              <div key={item.id}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">{item.label}</span>
                  <span className={colors.text}>{item.value}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors.bar}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
