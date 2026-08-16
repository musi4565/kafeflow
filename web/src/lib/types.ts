export type Role = "OWNER" | "WAITER";

export type OrderStatus = "NEW" | "PREPARING" | "READY" | "PAID" | "CANCELLED";

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "WAITING_PAYMENT";

export type PaymentMethod = "CASH" | "CARD" | "ONLINE";

export interface Product {
  id: string;
  code?: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  active?: boolean;
}

export interface MenuResponse {
  categories: string[];
  products: Product[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  code: string;
  tableNumber: number;
  table?: number;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
  cancelDeadline?: string;
  canCancel?: boolean;
  payment?: {
    method: PaymentMethod;
    amount?: number;
    paidAt?: string;
  } | null;
}

export interface TableInfo {
  id: string;
  code?: string;
  number: number;
  status: TableStatus;
  activeOrder: {
    id: string;
    code: string;
    total: number;
    status: OrderStatus;
  } | null;
}

export interface DashboardResponse {
  revenueToday: number;
  ordersToday: number;
  occupiedTables: number;
  totalTables: number;
  cancelledToday: number;
  topProduct: { name: string; qty: number } | null;
  recentOrders: Array<{
    id: string;
    code: string;
    tableNumber: number;
    total: number;
    status: OrderStatus;
  }>;
}

export type InventoryStatus = "YETARLI" | "KAMAYMOQDA" | "TUGAYAPTI";

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  status: InventoryStatus;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}
