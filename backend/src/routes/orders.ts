import { Router } from "express";
import { prisma } from "../db";
import { emitEvent } from "../socket";
import { notifyOrderReceived, notifyPreparing, notifyReady, notifyPaid } from "../telegram";
import { CANCEL_WINDOW_MS, orderCode, tableCode } from "../lib/format";
import { applyInventoryConsumption, serializeInventory } from "../lib/inventory";
import { getDashboard } from "../lib/dashboard";

const router = Router();

function serializeOrder(order: any) {
  const createdAt = new Date(order.createdAt);
  const cancelDeadline = new Date(createdAt.getTime() + CANCEL_WINDOW_MS);
  const canCancel = order.status === "NEW" && Date.now() < cancelDeadline.getTime();
  return {
    id: order.id,
    code: orderCode(order.id),
    tableNumber: order.table.number,
    tableCode: tableCode(order.table.number),
    status: order.status,
    total: order.total,
    items: order.items.map((it: any) => ({
      productId: it.productId,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
    })),
    payment: order.payment
      ? { method: order.payment.method, amount: order.payment.amount, createdAt: order.payment.createdAt }
      : null,
    createdAt: order.createdAt,
    cancelDeadline: cancelDeadline.toISOString(),
    canCancel,
  };
}

const orderInclude = { table: true, items: true, payment: true };

router.get("/", async (req, res) => {
  const statusParam = typeof req.query.status === "string" ? req.query.status : "";
  const statuses = statusParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const orders = await prisma.order.findMany({
    where: statuses.length > 0 ? { status: { in: statuses as any } } : undefined,
    include: orderInclude,
    orderBy: { createdAt: "asc" },
  });

  res.json(orders.map(serializeOrder));
});

router.post("/", async (req, res) => {
  const { tableNumber, items } = req.body ?? {};

  if (!tableNumber || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Stol raqami va mahsulotlar ro'yxati talab qilinadi." });
    return;
  }

  const table = await prisma.table.findUnique({ where: { number: Number(tableNumber) } });
  if (!table) {
    res.status(404).json({ error: "Stol topilmadi." });
    return;
  }

  const productIds = items.map((i: any) => Number(i.productId));
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, active: true } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    if (!productMap.has(Number(item.productId))) {
      res.status(400).json({ error: "Bu mahsulot hozir mavjud emas." });
      return;
    }
  }

  const total = items.reduce((sum: number, item: any) => {
    const product = productMap.get(Number(item.productId))!;
    return sum + product.price * Number(item.quantity);
  }, 0);

  const order = await prisma.order.create({
    data: {
      tableId: table.id,
      status: "NEW",
      total,
      items: {
        create: items.map((item: any) => {
          const product = productMap.get(Number(item.productId))!;
          return {
            productId: product.id,
            quantity: Number(item.quantity),
            price: product.price,
            name: product.name,
          };
        }),
      },
    },
    include: orderInclude,
  });

  await prisma.table.update({ where: { id: table.id }, data: { status: "OCCUPIED" } });

  const serialized = serializeOrder(order);
  emitEvent("order:new", serialized);
  emitEvent("table:updated", { id: table.id, code: tableCode(table.number), number: table.number, status: "OCCUPIED" });

  await notifyOrderReceived(order.id, table.number, total);

  res.status(201).json(serialized);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) {
    res.status(404).json({ error: "Buyurtma topilmadi." });
    return;
  }
  res.json(serializeOrder(order));
});

router.patch("/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};
  if (!["PREPARING", "READY"].includes(status)) {
    res.status(400).json({ error: "Noto'g'ri holat." });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) {
    res.status(404).json({ error: "Buyurtma topilmadi." });
    return;
  }

  if (status === "PREPARING" && order.status !== "NEW") {
    res.status(400).json({ error: "Bu buyurtma allaqachon jarayonda." });
    return;
  }
  if (status === "READY" && order.status !== "PREPARING") {
    res.status(400).json({ error: "Bu buyurtma hali tayyorlanmayapti." });
    return;
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: orderInclude,
  });

  if (status === "READY") {
    await prisma.table.update({ where: { id: order.tableId }, data: { status: "WAITING_PAYMENT" } });
    emitEvent("table:updated", {
      id: order.table.id,
      code: tableCode(order.table.number),
      number: order.table.number,
      status: "WAITING_PAYMENT",
    });
  }

  const serialized = serializeOrder(updated);
  emitEvent("order:updated", serialized);

  if (status === "PREPARING") await notifyPreparing(id);
  if (status === "READY") await notifyReady(id);

  res.json(serialized);
});

router.post("/:id/cancel", async (req, res) => {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) {
    res.status(404).json({ error: "Buyurtma topilmadi." });
    return;
  }

  if (order.status !== "NEW") {
    res.status(400).json({ error: "Bu buyurtmani endi bekor qilib bo'lmaydi." });
    return;
  }

  const deadline = new Date(order.createdAt).getTime() + CANCEL_WINDOW_MS;
  if (Date.now() > deadline) {
    res.status(400).json({ error: "🔒 Bekor qilish vaqti tugadi." });
    return;
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
    include: orderInclude,
  });

  await prisma.table.update({ where: { id: order.tableId }, data: { status: "AVAILABLE" } });
  emitEvent("table:updated", {
    id: order.table.id,
    code: tableCode(order.table.number),
    number: order.table.number,
    status: "AVAILABLE",
  });

  const serialized = serializeOrder(updated);
  emitEvent("order:updated", serialized);
  emitEvent("dashboard:updated", await getDashboard());

  res.json(serialized);
});

router.post("/:id/payment", async (req, res) => {
  const id = Number(req.params.id);
  const { method } = req.body ?? {};
  if (!["CASH", "CARD", "ONLINE"].includes(method)) {
    res.status(400).json({ error: "To'lov usuli noto'g'ri." });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) {
    res.status(404).json({ error: "Buyurtma topilmadi." });
    return;
  }
  if (order.status !== "READY") {
    res.status(400).json({ error: "To'lov amalga oshmadi. Qayta urinib ko'ring." });
    return;
  }

  const payment = await prisma.payment.create({
    data: { orderId: id, method, amount: order.total },
  });

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "PAID" },
    include: orderInclude,
  });

  await prisma.table.update({ where: { id: order.tableId }, data: { status: "AVAILABLE" } });
  emitEvent("table:updated", {
    id: order.table.id,
    code: tableCode(order.table.number),
    number: order.table.number,
    status: "AVAILABLE",
  });

  const inventory = await applyInventoryConsumption(order.items);
  emitEvent("inventory:updated", inventory);

  const serialized = serializeOrder(updated);
  emitEvent("order:updated", serialized);
  emitEvent("dashboard:updated", await getDashboard());

  await notifyPaid(id, order.total);

  res.json({ order: serialized, payment: { method: payment.method, amount: payment.amount } });
});

export default router;
