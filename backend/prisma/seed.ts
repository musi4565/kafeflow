import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PRODUCTS = [
  // Nonushta
  { name: "Omlet", description: "Pomidor va ko'katlar bilan yumshoq omlet", price: 22000, category: "Nonushta", imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80" },
  { name: "Granola kosasi", description: "Yogurt, asal va yong'oq bilan granola", price: 25000, category: "Nonushta", imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80" },
  { name: "Bodring-pomidor salat", description: "Ertalabki yengil sabzavotli salat", price: 18000, category: "Nonushta", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
  // Asosiy taomlar
  { name: "Burger", description: "Mol go'shti, pishloq va maxsus sous bilan", price: 35000, category: "Asosiy taomlar", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
  { name: "Pizza Margarita", description: "Pomidor sousi, motsarella va rayhon", price: 48000, category: "Asosiy taomlar", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
  { name: "Pasta Karbonara", description: "Qaymoqli sous, bekon va parmezan", price: 42000, category: "Asosiy taomlar", imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80" },
  { name: "Sendvich", description: "Tovuq go'shti va yangi sabzavotlar bilan", price: 28000, category: "Asosiy taomlar", imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800&q=80" },
  { name: "Sabzavotli sho'rva", description: "Uy taomiga o'xshash issiq sho'rva", price: 20000, category: "Asosiy taomlar", imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80" },
  { name: "Fri kartoshka", description: "Xrustli qovurilgan kartoshka", price: 15000, category: "Asosiy taomlar", imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&q=80" },
  // Ichimliklar
  { name: "Cola", description: "Sovutilgan gazlangan ichimlik, 0.5L", price: 10000, category: "Ichimliklar", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80" },
  { name: "Kofe Latte", description: "Ispan uslubidagi yumshoq lattemiz", price: 20000, category: "Ichimliklar", imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80" },
  { name: "Ko'k choy", description: "Anʼanaviy o'zbekcha ko'k choy", price: 8000, category: "Ichimliklar", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80" },
  { name: "Tabiiy sharbat", description: "Kunlik yangi siqilgan meva sharbati", price: 16000, category: "Ichimliklar", imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=80" },
  // Shirinliklar
  { name: "Shokoladli keks", description: "Issiq shokoladli keks, muzqaymoq bilan", price: 24000, category: "Shirinliklar", imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80" },
  { name: "Muzqaymoq", description: "Vanil ta'mli muzqaymoq, 2 shar", price: 14000, category: "Shirinliklar", imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80" },
];

const INVENTORY = [
  { name: "Mol go'shti", quantity: 4, unit: "kg", minThreshold: 3, criticalThreshold: 1 },
  { name: "Non", quantity: 8, unit: "dona", minThreshold: 6, criticalThreshold: 2 },
  { name: "Cola", quantity: 3, unit: "dona", minThreshold: 5, criticalThreshold: 2 },
  { name: "Kartoshka", quantity: 1, unit: "kg", minThreshold: 3, criticalThreshold: 1.5 },
  { name: "Pishloq", quantity: 5, unit: "kg", minThreshold: 2, criticalThreshold: 0.5 },
];

async function main() {
  console.log("[seed] tozalanmoqda...");
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.table.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log("[seed] userlar...");
  const ownerPass = await bcrypt.hash("123456", 10);
  const waiterPass = await bcrypt.hash("123456", 10);
  await prisma.user.createMany({
    data: [
      { email: "owner@kafeflow.uz", password: ownerPass, role: "OWNER", name: "Kafe egasi" },
      { email: "waiter@kafeflow.uz", password: waiterPass, role: "WAITER", name: "Ofitsiant" },
    ],
  });

  console.log("[seed] stollar...");
  const tables = [];
  for (let i = 0; i < 10; i++) {
    tables.push(await prisma.table.create({ data: { number: i + 1, status: "AVAILABLE" } }));
  }

  console.log("[seed] mahsulotlar...");
  const products = [];
  for (const p of PRODUCTS) {
    products.push(await prisma.product.create({ data: p }));
  }

  console.log("[seed] ombor...");
  await prisma.inventory.createMany({ data: INVENTORY });

  console.log("[seed] namunaviy buyurtmalar...");
  const byName = (n: string) => products.find((p) => p.name === n)!;
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

  async function createSampleOrder(opts: {
    tableNumber: number;
    items: { product: typeof products[number]; qty: number }[];
    status: "NEW" | "PREPARING" | "READY" | "PAID" | "CANCELLED";
    createdAt: Date;
    payMethod?: "CASH" | "CARD" | "ONLINE";
  }) {
    const table = tables[opts.tableNumber - 1];
    const total = opts.items.reduce((s, it) => s + it.product.price * it.qty, 0);
    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        status: opts.status,
        total,
        createdAt: opts.createdAt,
        cancelledAt: opts.status === "CANCELLED" ? opts.createdAt : undefined,
        items: {
          create: opts.items.map((it) => ({
            productId: it.product.id,
            quantity: it.qty,
            price: it.product.price,
            name: it.product.name,
          })),
        },
      },
    });

    if (opts.status === "PAID" && opts.payMethod) {
      await prisma.payment.create({ data: { orderId: order.id, method: opts.payMethod, amount: total, createdAt: opts.createdAt } });
      await prisma.table.update({ where: { id: table.id }, data: { status: "AVAILABLE" } });
    } else if (opts.status === "CANCELLED") {
      await prisma.table.update({ where: { id: table.id }, data: { status: "AVAILABLE" } });
    } else if (opts.status === "READY") {
      await prisma.table.update({ where: { id: table.id }, data: { status: "WAITING_PAYMENT" } });
    } else {
      await prisma.table.update({ where: { id: table.id }, data: { status: "OCCUPIED" } });
    }

    return order;
  }

  await createSampleOrder({
    tableNumber: 1,
    items: [{ product: byName("Burger"), qty: 2 }, { product: byName("Cola"), qty: 2 }],
    status: "PAID",
    createdAt: hoursAgo(3),
    payMethod: "CASH",
  });
  await createSampleOrder({
    tableNumber: 2,
    items: [{ product: byName("Pizza Margarita"), qty: 1 }],
    status: "PAID",
    createdAt: hoursAgo(2.5),
    payMethod: "CARD",
  });
  await createSampleOrder({
    tableNumber: 3,
    items: [{ product: byName("Pasta Karbonara"), qty: 1 }, { product: byName("Kofe Latte"), qty: 1 }],
    status: "PAID",
    createdAt: hoursAgo(2),
    payMethod: "ONLINE",
  });
  await createSampleOrder({
    tableNumber: 4,
    items: [{ product: byName("Burger"), qty: 1 }, { product: byName("Fri kartoshka"), qty: 1 }],
    status: "PAID",
    createdAt: hoursAgo(1.5),
    payMethod: "CASH",
  });
  await createSampleOrder({
    tableNumber: 5,
    items: [{ product: byName("Sendvich"), qty: 1 }],
    status: "CANCELLED",
    createdAt: hoursAgo(1),
  });
  await createSampleOrder({
    tableNumber: 6,
    items: [{ product: byName("Burger"), qty: 3 }],
    status: "READY",
    createdAt: hoursAgo(0.3),
  });
  await createSampleOrder({
    tableNumber: 7,
    items: [{ product: byName("Sabzavotli sho'rva"), qty: 2 }],
    status: "PREPARING",
    createdAt: hoursAgo(0.15),
  });
  await createSampleOrder({
    tableNumber: 8,
    items: [{ product: byName("Muzqaymoq"), qty: 2 }, { product: byName("Cola"), qty: 1 }],
    status: "NEW",
    createdAt: hoursAgo(0.02),
  });

  console.log("[seed] tayyor.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
