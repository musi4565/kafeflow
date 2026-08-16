import type {
  DashboardResponse,
  InventoryItem,
  MenuResponse,
  Order,
  PaymentMethod,
  TableInfo,
} from "./types";

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError("⚠️ Internet aloqasi yoʻq.");
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ||
      (res.status === 401
        ? "Email yoki parol notoʻgʻri."
        : res.status === 400
          ? "Soʻrovda xatolik yuz berdi."
          : "Xatolik yuz berdi. Qayta urinib koʻring.");
    throw new ApiError(message, res.status);
  }

  return data as T;
}

function authHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem("kafeflow_auth");
    if (!raw) return {};
    const auth = JSON.parse(raw) as { token?: string };
    return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
  } catch {
    return {};
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; role: "OWNER" | "WAITER"; name: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMenu: () => request<MenuResponse>("/api/menu"),

  getTables: () => request<TableInfo[]>("/api/tables", { headers: authHeaders() }),

  createOrder: (tableNumber: number, items: { productId: string; quantity: number }[]) =>
    request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify({ tableNumber, items }),
    }),

  getOrder: (id: string) => request<Order>(`/api/orders/${id}`),

  getOrders: (statuses: string[]) =>
    request<Order[]>(`/api/orders?status=${statuses.join(",")}`),

  updateOrderStatus: (id: string, status: "PREPARING" | "READY") =>
    request<Order>(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  cancelOrder: (id: string) =>
    request<Order>(`/api/orders/${id}/cancel`, { method: "POST" }),

  payOrder: (id: string, method: PaymentMethod) =>
    request<{ order: Order; payment: unknown }>(`/api/orders/${id}/payment`, {
      method: "POST",
      body: JSON.stringify({ method }),
      headers: authHeaders(),
    }),

  getDashboard: () => request<DashboardResponse>("/api/dashboard", { headers: authHeaders() }),

  getInventory: () => request<InventoryItem[]>("/api/inventory", { headers: authHeaders() }),
};
