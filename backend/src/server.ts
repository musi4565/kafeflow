import "dotenv/config";
import { createServer } from "http";
import { createApp } from "./app";
import { initSocket } from "./socket";
import { startBot } from "./telegram";

const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const app = createApp();
const httpServer = createServer(app);
initSocket(httpServer, CORS_ORIGIN);

httpServer.listen(PORT, () => {
  console.log(`[kafeflow] backend http://localhost:${PORT}`);
  startBot();
});
