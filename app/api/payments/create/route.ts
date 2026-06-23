import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createPayment, yookassaConfigured } from "@/lib/yookassa";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  let body: { packageName?: string; period?: string; amount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const packageName = String(body.packageName ?? "").trim();
  const period = String(body.period ?? "").trim();
  const amount = Math.round(Number(body.amount ?? 0));

  if (!packageName || amount <= 0) {
    return NextResponse.json({ error: "Некорректная сумма" }, { status: 400 });
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const returnUrl = `${appUrl}/cabinet?paid=1`;

  const payment = await prisma.payment.create({
    data: { userId: session.user.id, packageName, period, amount, status: "pending" },
  });

  // Без ключей ЮKassa — режим демонстрации: сразу помечаем оплаченным.
  if (!yookassaConfigured()) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "paid", paidAt: new Date() },
    });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { packageName },
    });
    return NextResponse.json({ confirmationUrl: returnUrl, demo: true });
  }

  try {
    const yoo = await createPayment({
      amount,
      description: `Пакет «${packageName}» · ${period}`,
      returnUrl,
      metadata: { paymentId: payment.id },
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { yookassaId: yoo.id },
    });
    if (!yoo.confirmationUrl) {
      return NextResponse.json({ error: "ЮKassa не вернула ссылку оплаты" }, { status: 502 });
    }
    return NextResponse.json({ confirmationUrl: yoo.confirmationUrl });
  } catch (e) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка ЮKassa" },
      { status: 502 }
    );
  }
}
