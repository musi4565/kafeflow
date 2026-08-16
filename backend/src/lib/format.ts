export const CANCEL_WINDOW_MS = 3 * 60 * 1000;

export function orderCode(id: number): string {
  return `ORD-${String(id).padStart(3, "0")}`;
}

export function productCode(id: number): string {
  return `PROD-${String(id).padStart(3, "0")}`;
}

export function tableCode(number: number): string {
  return `STOL-${String(number).padStart(2, "0")}`;
}

export function paymentCode(id: number): string {
  return `PAY-${String(id).padStart(3, "0")}`;
}

export function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
