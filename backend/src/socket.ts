import type { Server as HttpServer } from "http";
import { Server, type Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export function initSocket(httpServer: HttpServer, corsOrigin: string): IOServer {
  io = new Server(httpServer, {
    cors: { origin: corsOrigin, methods: ["GET", "POST", "PATCH"] },
  });
  return io;
}

export function emitEvent(event: string, payload: unknown): void {
  if (!io) return;
  io.emit(event, payload);
}
