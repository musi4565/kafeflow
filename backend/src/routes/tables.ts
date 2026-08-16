import { Router } from "express";
import { prisma } from "../db";
import { tableCode, orderCode } from "../lib/format";

const router = Router();

router.get("/", async (_req, res) => {
  const tables = await prisma.table.findMany({
    orderBy: { number: "asc" },
    include: {
      orders: {
        where: { status: { in: ["NEW", "PREPARING", "READY"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  res.json(
    tables.map((t) => {
      const active = t.orders[0];
      return {
        id: t.id,
        code: tableCode(t.number),
        number: t.number,
        status: t.status,
        activeOrder: active
          ? { id: active.id, code: orderCode(active.id), total: active.total, status: active.status }
          : null,
      };
    })
  );
});

export default router;
