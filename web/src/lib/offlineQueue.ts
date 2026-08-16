import { api } from "./api";
import type { PaymentMethod } from "./types";

interface QueuedPayment {
  orderId: string;
  method: PaymentMethod;
  queuedAt: string;
}

const KEY = "kafeflow_offline_queue";

export function queuePayment(orderId: string, method: PaymentMethod) {
  const queue = readQueue();
  queue.push({ orderId, method, queuedAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(queue));
}

function readQueue(): QueuedPayment[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedPayment[]) : [];
  } catch {
    return [];
  }
}

export async function flushOfflineQueue(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;
  const remaining: QueuedPayment[] = [];
  let succeeded = 0;
  for (const item of queue) {
    try {
      await api.payOrder(item.orderId, item.method);
      succeeded++;
    } catch {
      remaining.push(item);
    }
  }
  localStorage.setItem(KEY, JSON.stringify(remaining));
  return succeeded;
}
