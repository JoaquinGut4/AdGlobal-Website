import type { InventarioRegistro, PedidoRegistro, SupportTicket } from '@/types';

export interface TicketInventoryResult {
  inventory: InventarioRegistro[];
  previousStates: Record<string, string>;
  changed: number;
}

export function occupiedByTicket(
  assetIds: string[],
  tickets: SupportTicket[],
): SupportTicket | undefined {
  const selected = new Set(assetIds);
  return tickets.find((ticket) =>
    ticket.estado !== 'Resuelto' && ticket.equiposIds?.some((id) => selected.has(id)),
  );
}

export function sendAssetsToWorkshop(
  assetIds: string[],
  inventory: InventarioRegistro[],
): TicketInventoryResult {
  const selected = new Set(assetIds);
  const previousStates: Record<string, string> = {};
  let changed = 0;
  const next = inventory.map((asset) => {
    if (!selected.has(asset.id)) return asset;
    previousStates[asset.id] = asset.estado;
    if (asset.estado === 'Taller') return asset;
    changed += 1;
    return { ...asset, estado: 'Taller' };
  });
  return { inventory: next, previousStates, changed };
}

/** Don't undo a manual state change made while the ticket was open. */
export function restoreAssetsFromTicket(
  ticket: SupportTicket,
  inventory: InventarioRegistro[],
): { inventory: InventarioRegistro[]; restored: number; skipped: number } {
  if (ticket.estado === 'Resuelto' || !ticket.estadosAnteriores) {
    return { inventory, restored: 0, skipped: 0 };
  }
  let restored = 0;
  let skipped = 0;
  const next = inventory.map((asset) => {
    const previous = ticket.estadosAnteriores?.[asset.id];
    if (previous === undefined) return asset;
    if (asset.estado !== 'Taller') {
      skipped += 1;
      return asset;
    }
    if (previous === 'Taller') return asset;
    restored += 1;
    return { ...asset, estado: previous };
  });
  return { inventory: next, restored, skipped };
}

/** When an order is closed while its asset is in workshop, restore to the pre-order state later. */
export function rebaseTicketsAfterOrderRelease(
  order: PedidoRegistro,
  tickets: SupportTicket[],
): SupportTicket[] {
  const before = order.estadosAnteriores;
  const assignedState = order.motivoTraslado === 'Alquiler'
    ? 'Alquiler'
    : order.motivoTraslado.startsWith('Venta') ? 'Venta' : null;
  if (!before || !assignedState) return tickets;

  return tickets.map((ticket) => {
    if (ticket.estado === 'Resuelto' || !ticket.estadosAnteriores) return ticket;
    let changed = false;
    const states = { ...ticket.estadosAnteriores };
    for (const [id, original] of Object.entries(before)) {
      if (states[id] === assignedState) {
        states[id] = original;
        changed = true;
      }
    }
    return changed ? { ...ticket, estadosAnteriores: states } : ticket;
  });
}
