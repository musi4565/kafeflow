import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutGrid, Package, TrendingUp } from "lucide-react";
import { LoadingState, ErrorState, EmptyState } from "../components/States";
import { api, ApiError } from "../lib/api";
import { formatSum } from "../lib/format";
import { getSocket } from "../lib/socket";
import { inventoryStatusColor, inventoryStatusLabel, orderStatusColor, orderStatusLabel } from "../lib/labels";
import { useAuth } from "../context/AuthContext";
import type { DashboardResponse, InventoryItem } from "../lib/types";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 pt-2" style={{ height: 120 }} role="img" aria-label="Buyurtmalar summasi diagrammasi">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md bg-moss/70"
            style={{ height: `${Math.max(6, (d.value / max) * 96)}px` }}
          />
          <span className="text-[10px] text-charcoal/50">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Owner() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [invLoading, setInvLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invError, setInvError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Maʼlumotlarni yuklab boʻlmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInventory = useCallback(async () => {
    try {
      const data = await api.getInventory();
      setInventory(data);
      setInvError(null);
    } catch (e) {
      setInvError(e instanceof ApiError ? e.message : "Ombor maʼlumotlarini yuklab boʻlmadi.");
    } finally {
      setInvLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadInventory();
  }, [loadDashboard, loadInventory]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
      loadInventory();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadDashboard, loadInventory]);

  useEffect(() => {
    const socket = getSocket();
    const onDashboard = () => loadDashboard();
    const onInventory = () => loadInventory();
    socket.on("dashboard:updated", onDashboard);
    socket.on("order:new", onDashboard);
    socket.on("order:updated", onDashboard);
    socket.on("inventory:updated", onInventory);
    return () => {
      socket.off("dashboard:updated", onDashboard);
      socket.off("order:new", onDashboard);
      socket.off("order:updated", onDashboard);
      socket.off("inventory:updated", onInventory);
    };
  }, [loadDashboard, loadInventory]);

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-charcoal/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-6 w-6 text-moss" aria-hidden="true" />
            <div>
              <h1 className="font-display text-2xl font-semibold">Boshqaruv paneli</h1>
              <p className="text-xs text-charcoal/50">{auth?.name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/kirish");
            }}
            className="focus-ring flex items-center gap-2 rounded-full border border-charcoal/20 px-4 py-2 text-sm font-medium hover:border-charcoal/40"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Chiqish
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="mb-4 text-lg font-semibold">Bugungi holat</h2>

        {loading && <LoadingState label="Maʼlumotlar yuklanmoqda..." />}
        {!loading && error && <ErrorState message={error} onRetry={loadDashboard} />}

        {!loading && !error && dashboard && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Tushum" value={formatSum(dashboard.revenueToday)} />
              <StatTile label="Buyurtmalar" value={String(dashboard.ordersToday)} />
              <StatTile
                label="Band stollar"
                value={`${dashboard.occupiedTables} / ${dashboard.totalTables}`}
              />
              <StatTile label="Bekor qilingan" value={String(dashboard.cancelledToday)} />
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <section className="lg:col-span-2 rounded-2xl border border-charcoal/10 bg-white p-6">
                <h3 className="mb-4 text-base font-semibold">Bugungi buyurtmalar</h3>
                {dashboard.recentOrders.length === 0 ? (
                  <EmptyState title="Hozircha buyurtma yoʻq" />
                ) : (
                  <ul className="divide-y divide-charcoal/10">
                    {dashboard.recentOrders.map((o) => (
                      <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                        <span className="font-medium">№{o.code}</span>
                        <span className="text-charcoal/60">
                          Stol №{String(o.tableNumber).padStart(2, "0")}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusColor(o.status)}`}
                        >
                          {orderStatusLabel(o.status)}
                        </span>
                        <span className="font-semibold">{formatSum(o.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-charcoal/10 bg-white p-6">
                <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
                  <TrendingUp className="h-4 w-4 text-moss" aria-hidden="true" /> Kunlik hisobot
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-charcoal/60">Jami tushum</dt>
                    <dd className="font-semibold">{formatSum(dashboard.revenueToday)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal/60">Jami buyurtmalar</dt>
                    <dd className="font-semibold">{dashboard.ordersToday}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal/60">Bekor qilingan</dt>
                    <dd className="font-semibold">{dashboard.cancelledToday}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal/60">Eng koʻp sotilgan</dt>
                    <dd className="font-semibold">
                      {dashboard.topProduct ? `${dashboard.topProduct.name} (${dashboard.topProduct.qty})` : "—"}
                    </dd>
                  </div>
                </dl>

                {dashboard.recentOrders.length > 0 && (
                  <MiniBarChart
                    data={dashboard.recentOrders.slice(0, 6).map((o) => ({
                      label: `№${o.code.replace("ORD-", "")}`,
                      value: o.total,
                    }))}
                  />
                )}
              </section>
            </div>
          </>
        )}

        <section className="mt-10 rounded-2xl border border-charcoal/10 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Package className="h-4 w-4 text-moss" aria-hidden="true" /> Ombor
          </h3>

          {invLoading && <LoadingState label="Ombor yuklanmoqda..." />}
          {!invLoading && invError && <ErrorState message={invError} onRetry={loadInventory} />}
          {!invLoading && !invError && inventory.length === 0 && (
            <EmptyState title="Ombor maʼlumotlari yoʻq" />
          )}

          {!invLoading && !invError && inventory.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10 text-xs uppercase tracking-wide text-charcoal/50">
                    <th className="py-2 pr-4 font-medium">Mahsulot</th>
                    <th className="py-2 pr-4 font-medium">Miqdor</th>
                    <th className="py-2 pr-4 font-medium">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b border-charcoal/5">
                      <td className="py-3 pr-4 font-medium">{item.name}</td>
                      <td className="py-3 pr-4 text-charcoal/70">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${inventoryStatusColor(item.status)}`}
                        >
                          {inventoryStatusLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
