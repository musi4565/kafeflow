import { Router } from "express";
import { prisma } from "../db";
import { serializeInventory } from "../lib/inventory";

const router = Router();

router.get("/", async (_req, res) => {
  const items = await prisma.inventory.findMany({ orderBy: { id: "asc" } });
  res.json(serializeInventory(items));
});

export default router;
