import type { InventarioRegistro, PedidoRegistro } from '@/types';

export interface InventorySyncResult {
  inventory: InventarioRegistro[];
  targetState: 'Alquiler' | 'Venta' | null;
  matched: number;
  updated: number;
  previousStates: Record<string, string>;
}

export interface InventoryRestoreResult {
  inventory: InventarioRegistro[];
  restored: number;
  skipped: number;
}

/** A SKU must be a whole token, not a substring of another SKU. */
export function skuInDescription(description: string, sku: string): boolean {
  const normalized = description.toUpperCase();
  const target = sku.toUpperCase();
  let offset = normalized.indexOf(target);

  while (offset !== -1) {
    const before = normalized[offset - 1];
    const after = normalized[offset + target.length];
    if ((!before || !/[A-Z0-9-]/.test(before)) && (!after || !/[A-Z0-9-]/.test(after))) {
      return true;
    }
    offset = normalized.indexOf(target, offset + 1);
  }
  return false;
}

/** Every matching, distinct SKU represents one physical product in the order. */
export function orderSkusFromDescription(
  description: string,
  inventory: InventarioRegistro[],
): string[] {
  const seen = new Set<string>();
  return inventory.flatMap((item) => {
    const sku = item.sku.trim();
    const key = sku.toUpperCase();
    if (!sku || seen.has(key) || !skuInDescription(description, sku)) return [];
    seen.add(key);
    return [sku];
  });
}

export function assetsForOrder(order: PedidoRegistro, inventory: InventarioRegistro[]): InventarioRegistro[] {
  const listed = new Set((order.skus ?? []).map((sku) => sku.trim().toUpperCase()));
  return inventory.filter((asset) => asset.sku &&
    (listed.has(asset.sku.toUpperCase()) || skuInDescription(order.descripcionProductos, asset.sku)));
}

/** Pure operation: the caller persists the returned inventory together with the order. */
export function syncInventoryForOrder(
  order: PedidoRegistro,
  inventory: InventarioRegistro[],
): InventorySyncResult {
  const targetState = order.motivoTraslado === 'Alquiler'
    ? 'Alquiler'
    : order.motivoTraslado.startsWith('Venta')
      ? 'Venta'
      : null;

  if (!targetState) return { inventory, targetState, matched: 0, updated: 0, previousStates: {} };

  const selectedSkus = new Set((order.skus ?? []).map((sku) => sku.trim().toUpperCase()));
  let matched = 0;
  let updated = 0;
  const previousStates: Record<string, string> = {};
  const nextInventory = inventory.map((item) => {
    const sku = item.sku.trim();
    if (!sku || (!selectedSkus.has(sku.toUpperCase()) && !skuInDescription(order.descripcionProductos, sku))) {
      return item;
    }
    matched += 1;
    previousStates[item.id] = item.estado;
    if (item.estado === targetState) return item;
    updated += 1;
    return { ...item, estado: targetState };
  });

  return { inventory: nextInventory, targetState, matched, updated, previousStates };
}

/** Restore only states set by this order; never overwrite a later manual change. */
export function restoreInventoryForOrder(
  order: PedidoRegistro,
  inventory: InventarioRegistro[],
  action: 'finish' | 'delete',
): InventoryRestoreResult {
  const noChanges = { inventory, restored: 0, skipped: 0 };
  if (action === 'finish' && (order.estadoPedido === 'Finalizado' || order.motivoTraslado !== 'Alquiler')) {
    return noChanges;
  }
  if (action === 'delete' && order.estadoPedido === 'Finalizado' && order.motivoTraslado === 'Alquiler') {
    return noChanges;
  }

  const expected = order.motivoTraslado === 'Alquiler'
    ? 'Alquiler'
    : order.motivoTraslado.startsWith('Venta')
      ? 'Venta'
      : null;
  if (!expected || !order.estadosAnteriores) return noChanges;

  let restored = 0;
  let skipped = 0;
  const nextInventory = inventory.map((item) => {
    const original = order.estadosAnteriores?.[item.id];
    if (original === undefined) return item;
    if (item.estado !== expected) {
      skipped += 1;
      return item;
    }
    if (item.estado === original) return item;
    restored += 1;
    return { ...item, estado: original };
  });
  return { inventory: nextInventory, restored, skipped };
}
