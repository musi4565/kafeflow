import { Router } from "express";
import { prisma } from "../db";
import { productCode } from "../lib/format";

const router = Router();

router.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
  });
  const categories = [...new Set(products.map((p) => p.category))];
  res.json({
    categories,
    products: products.map((p) => ({
      id: p.id,
      code: productCode(p.id),
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      imageUrl: p.imageUrl,
      active: p.active,
    })),
  });
});

export default router;
