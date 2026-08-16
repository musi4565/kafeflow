import { Router } from "express";
import { getDashboard } from "../lib/dashboard";

const router = Router();

router.get("/", async (_req, res) => {
  res.json(await getDashboard());
});

export default router;
