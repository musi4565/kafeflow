import { prisma } from "../db";
import { orderCode, todayStart } from "./format";

export async function getDashboard() {
  const start = todayStart();

  const [revenueAgg, ordersToday, occupiedTables, totalTables, cancelledToday, recentOrders] =
    await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: start } } }),
      prisma.order.count({ where: { createdAt: { gte: start } } }),
      prisma.table.count({ where: { status: { not: "AVAILABLE" } } }),
      prisma.table.count(),
      prisma.order.count({ where: { status: "CANCELLED", cancelledAt: { gte: start } } }),
      prisma.order.findMany({
        where: { createdAt: { gte: start } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { table: true },
      }),
    ]);

  const topItems = await prisma.orderItem.groupBy({
    by: ["name"],
    where: { order: { createdAt: { gte: start }, status: { not: "CANCELLED" } } },
    _sum: { quantity: true },
  });
  const top = topItems.sort((a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0))[0];

  return {
    revenueToday: revenueAgg._sum.amount ?? 0,
    ordersToday,
    occupiedTables,
    totalTables,
    cancelledToday,
    topProduct: top ? { name: top.name, qty: top._sum.quantity ?? 0 } : null,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      code: orderCode(o.id),
      tableNumber: o.table.number,
      total: o.total,
      status: o.status,
    })),
  };
}
