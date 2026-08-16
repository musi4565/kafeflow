import { Telegraf } from "telegraf";
import { prisma } from "./db";
import { orderCode } from "./lib/format";

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_CHAT_ID;

export const bot = token ? new Telegraf(token) : null;

async function logNotification(orderId: number | null, type: string, message: string) {
  await prisma.notification.create({ data: { orderId: orderId ?? undefined, type, message } });
}

async function send(message: string, orderId: number | null, type: string) {
  await logNotification(orderId, type, message);
  if (bot && adminChatId) {
    try {
      await bot.telegram.sendMessage(adminChatId, message);
    } catch (err) {
      console.error("[telegram] xabar yuborilmadi:", (err as Error).message);
    }
  } else {
    console.log(`[telegram-mock] ${message}`);
  }
}

export async function notifyOrderReceived(orderId: number, tableNumber: number, total: number) {
  await send(
    `🍽 KafeFlow\nBuyurtmangiz qabul qilindi.\nBuyurtma: ${orderCode(orderId)}\nStol: №${String(tableNumber).padStart(2, "0")}\nJami: ${total.toLocaleString("ru-RU")} so'm`,
    orderId,
    "ORDER_RECEIVED"
  );
}

export async function notifyPreparing(orderId: number) {
  await send(
    `👨‍🍳 Buyurtmangiz tayyorlanmoqda.\nBuyurtma: ${orderCode(orderId)}`,
    orderId,
    "PREPARING"
  );
}

export async function notifyReady(orderId: number) {
  await send(`✓ Buyurtmangiz tayyor!\nBuyurtma: ${orderCode(orderId)}`, orderId, "READY");
}

export async function notifyPaid(orderId: number, amount: number) {
  await send(
    `💳 To'lov muvaffaqiyatli amalga oshirildi.\nBuyurtma: ${orderCode(orderId)}\nSumma: ${amount.toLocaleString("ru-RU")} so'm`,
    orderId,
    "PAID"
  );
}

export function startBot(): void {
  if (!bot) {
    console.log("[telegram] TELEGRAM_BOT_TOKEN berilmagan — mock notification rejimida ishlayapti.");
    return;
  }

  bot.start(async (ctx) => {
    console.log(`[telegram] /start qabul qilindi. chat.id=${ctx.chat.id}`);
    await logNotification(null, "BOT_START", `chat.id=${ctx.chat.id} bot bilan suhbatni boshladi.`);
    await ctx.reply(
      "🍽 KafeFlow botiga xush kelibsiz!\n\nBuyurtma holatini bilish uchun quyidagicha yozing:\n/holat ORD-001"
    );
  });

  bot.command("holat", async (ctx) => {
    const parts = ctx.message.text.split(" ").filter(Boolean);
    const code = parts[1];
    if (!code) {
      await ctx.reply("Buyurtma raqamini kiriting. Masalan: /holat ORD-001");
      return;
    }
    const match = code.match(/(\d+)/);
    const id = match ? parseInt(match[1], 10) : NaN;
    if (!id) {
      await ctx.reply("Buyurtma raqami noto'g'ri.");
      return;
    }
    const order = await prisma.order.findUnique({ where: { id }, include: { table: true } });
    if (!order) {
      await ctx.reply(`${code} topilmadi.`);
      return;
    }
    const labels: Record<string, string> = {
      NEW: "Qabul qilindi",
      PREPARING: "Tayyorlanmoqda",
      READY: "Tayyor",
      PAID: "To'landi",
      CANCELLED: "Bekor qilindi",
    };
    await ctx.reply(
      `${orderCode(order.id)} — Stol №${String(order.table.number).padStart(2, "0")}\nHolat: ${labels[order.status]}\nJami: ${order.total.toLocaleString("ru-RU")} so'm`
    );
  });

  bot.launch().then(() => console.log("[telegram] bot ishga tushdi"));
}
