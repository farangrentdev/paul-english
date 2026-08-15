import { prisma } from "@/lib/db";

export type PackageBalance = {
  id: string;
  packageName: string;
  total: number;
  used: number;
  left: number;
};

/** Активный пакет ученика — первый непотраченный (старые расходуются раньше). */
export async function getActivePurchase(userId: string) {
  const purchases = await prisma.packagePurchase.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return purchases.find((p) => p.lessonsUsed < p.lessonsTotal) ?? null;
}

/** Суммарный остаток по всем пакетам ученика. */
export async function getBalances(userId: string): Promise<PackageBalance[]> {
  const purchases = await prisma.packagePurchase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return purchases.map((p) => ({
    id: p.id,
    packageName: p.packageName,
    total: p.lessonsTotal,
    used: p.lessonsUsed,
    left: Math.max(0, p.lessonsTotal - p.lessonsUsed),
  }));
}

export async function getLessonsLeft(userId: string): Promise<number> {
  const balances = await getBalances(userId);
  return balances.reduce((sum, b) => sum + b.left, 0);
}

/**
 * Синхронизирует списание занятия с пакетом.
 * Списываем ровно один раз — по метке countedAt, поэтому повторные
 * сохранения статуса не «съедают» лишние занятия, а возврат в план возвращает.
 */
export async function syncLessonUsage(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return;

  const shouldCount = lesson.status === "done";

  // Нужно списать, но ещё не списывали.
  if (shouldCount && !lesson.countedAt) {
    const purchase =
      (lesson.purchaseId
        ? await prisma.packagePurchase.findUnique({ where: { id: lesson.purchaseId } })
        : null) ?? (await getActivePurchase(lesson.userId));
    if (!purchase) return; // нет оплаченного пакета — просто не списываем

    await prisma.$transaction([
      prisma.packagePurchase.update({
        where: { id: purchase.id },
        data: { lessonsUsed: { increment: 1 } },
      }),
      prisma.lesson.update({
        where: { id: lessonId },
        data: { purchaseId: purchase.id, countedAt: new Date() },
      }),
    ]);
    return;
  }

  // Списывали, но занятие больше не «проведено» — возвращаем.
  if (!shouldCount && lesson.countedAt && lesson.purchaseId) {
    await prisma.$transaction([
      prisma.packagePurchase.update({
        where: { id: lesson.purchaseId },
        data: { lessonsUsed: { decrement: 1 } },
      }),
      prisma.lesson.update({
        where: { id: lessonId },
        data: { countedAt: null },
      }),
    ]);
  }
}

/** Создаёт покупку пакета после успешной оплаты (идемпотентно по платежу). */
export async function createPurchaseForPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { purchase: true },
  });
  if (!payment || payment.purchase) return;

  const pkg = await prisma.package.findFirst({ where: { name: payment.packageName } });
  const lessonsTotal = pkg?.lessonsCount ?? 0;
  if (lessonsTotal <= 0) return;

  await prisma.packagePurchase.create({
    data: {
      userId: payment.userId,
      packageName: payment.packageName,
      lessonsTotal,
      paymentId: payment.id,
      note: payment.period || null,
    },
  });
}
