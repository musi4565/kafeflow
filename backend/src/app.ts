import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import menuRoutes from "./routes/menu";
import tableRoutes from "./routes/tables";
import orderRoutes from "./routes/orders";
import dashboardRoutes from "./routes/dashboard";
import inventoryRoutes from "./routes/inventory";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/menu", menuRoutes);
  app.use("/api/tables", tableRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/inventory", inventoryRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: "Yo'l topilmadi." });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Serverda xatolik yuz berdi." });
  });

  return app;
}
