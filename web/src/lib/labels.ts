import type { InventoryStatus, OrderStatus, TableStatus } from "./types";

export const orderStatusLabel = (status: OrderStatus, context: "customer" | "kitchen" = "customer"): string => {
  switch (status) {
    case "NEW":
      return context === "kitchen" ? "Yangi" : "Qabul qilindi";
    case "PREPARING":
      return "Tayyorlanmoqda";
    case "READY":
      return "Tayyor";
    case "PAID":
      return "Toʻlandi";
    case "CANCELLED":
      return "Bekor qilindi";
    default:
      return status;
  }
};

export const tableStatusLabel = (status: TableStatus): string => {
  switch (status) {
    case "AVAILABLE":
      return "Boʻsh";
    case "OCCUPIED":
      return "Buyurtma bor";
    case "WAITING_PAYMENT":
      return "Toʻlov kutilmoqda";
    default:
      return status;
  }
};

export const inventoryStatusLabel = (status: InventoryStatus): string => {
  switch (status) {
    case "YETARLI":
      return "Yetarli";
    case "KAMAYMOQDA":
      return "Kamaymoqda";
    case "TUGAYAPTI":
      return "Tugayapti";
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
