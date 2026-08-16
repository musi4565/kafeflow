import { translate, type Language } from "./translations";
import type { InventoryStatus, OrderStatus, TableStatus } from "./types";

export const orderStatusLabel = (
  status: OrderStatus,
  language: Language,
  context: "customer" | "kitchen" = "customer"
): string => {
  switch (status) {
    case "NEW":
      return translate(language, context === "kitchen" ? "label.order.new.kitchen" : "label.order.new.customer");
    case "PREPARING":
      return translate(language, "label.order.preparing");
    case "READY":
      return translate(language, "label.order.ready");
    case "PAID":
      return translate(language, "label.order.paid");
    case "CANCELLED":
      return translate(language, "label.order.cancelled");
    default:
      return status;
  }
};

export const tableStatusLabel = (status: TableStatus, language: Language): string => {
  switch (status) {
    case "AVAILABLE":
      return translate(language, "label.table.available");
    case "OCCUPIED":
      return translate(language, "label.table.occupied");
    case "WAITING_PAYMENT":
      return translate(language, "label.table.waitingPayment");
    default:
      return status;
  }
};

export const inventoryStatusLabel = (status: InventoryStatus, language: Language): string => {
  switch (status) {
    case "YETARLI":
      return translate(language, "label.inventory.yetarli");
    case "KAMAYMOQDA":
      return translate(language, "label.inventory.kamaymoqda");
    case "TUGAYAPTI":
      return translate(language, "label.inventory.tugayapti");
    default:
      return status;
  }
};

export const inventoryStatusColor = (status: InventoryStatus): string => {
  switch (status) {
    case "YETARLI":
      return "text-moss bg-moss/10";
    case "KAMAYMOQDA":
      return "text-amber-700 bg-amber-100";
    case "TUGAYAPTI":
      return "text-red-700 bg-red-100";
    default:
      return "text-charcoal bg-beige";
  }
};

export const tableStatusColor = (status: TableStatus): string => {
  switch (status) {
    case "AVAILABLE":
      return "text-moss bg-moss/10 border-moss/30";
    case "OCCUPIED":
      return "text-charcoal bg-beige border-beige";
    case "WAITING_PAYMENT":
      return "text-amber-800 bg-amber-100 border-amber-300";
    default:
      return "text-charcoal bg-beige border-beige";
  }
};

export const orderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "NEW":
      return "text-amber-800 bg-amber-100";
    case "PREPARING":
      return "text-blue-800 bg-blue-100";
    case "READY":
      return "text-moss bg-moss/10";
    case "PAID":
      return "text-charcoal bg-beige";
    case "CANCELLED":
      return "text-red-700 bg-red-100";
    default:
      return "text-charcoal bg-beige";
  }
};
