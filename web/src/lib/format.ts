export function formatSum(value: number): string {
  const rounded = Math.round(value || 0);
  return `${rounded.toLocaleString("ru-RU").replace(/,/g, " ")} soʻm`;
}

export function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const mm = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
