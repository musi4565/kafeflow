import { prisma } from "../db";

type ConsumptionRule = { match: RegExp; inventoryName: string; perUnit: number };

const RULES: ConsumptionRule[] = [
  { match: /burger/i, inventoryName: "Mol go'shti", perUnit: 0.15 },
  { match: /burger/i, inventoryName: "Non", perUnit: 1 },
  { match: /pizza/i, inventoryName: "Mol go'shti", perUnit: 0.1 },
  { match: /cola|kola/i, inventoryName: "Cola", perUnit: 1 },
  { match: /kartoshka|fri/i, inventoryName: "Kartoshka", perUnit: 0.3 },
];

export async function applyInventoryConsumption(items: { name: string; quantity: number }[]) {
  for (const item of items) {
    for (const rule of RULES) {
      if (rule.match.test(item.name)) {
        const inv = await prisma.inventory.findFirst({ where: { name: rule.inventoryName } });
        if (inv) {
          const nextQty = Math.max(0, inv.quantity - rule.perUnit * item.quantity);
          await prisma.inventory.update({ where: { id: inv.id }, data: { quantity: nextQty } });
        }
      }
    }
  }
  return serializeInventory(await prisma.inventory.findMany({ orderBy: { id: "asc" } }));
}

export function statusOf(inv: { quantity: number; minThreshold: number; criticalThreshold: number }): string {
  if (inv.quantity <= inv.criticalThreshold) return "TUGAYAPTI";
  if (inv.quantity <= inv.minThreshold) return "KAMAYMOQDA";
  return "YETARLI";
}

export function serializeInventory(items: any[]) {
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    unit: i.unit,
    minThreshold: i.minThreshold,
    status: statusOf(i),
  }));
}
