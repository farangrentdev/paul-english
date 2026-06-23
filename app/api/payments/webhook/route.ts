import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPayment, yookassaConfigured } from "@/lib/yookassa";

// Webhook ЮKassa: payment.succeeded / payment.canceled.
// Для надёжности перепроверяем статус через API по id.
export async function POST(req: Request) {
  if (!yookassaConfigured()) {
    return NextResponse.json({ ok: true, skipped: "not configured" });
  }

  let event: { event?: string; object?: { id?: string; metadata?: Record<string, string> } };
  try {
    event = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const yooId = event.object?.id;
  if (!yooId) return NextResponse.json({ error: "no id" }, { status: 400 });

  // Перепроверяем реальный статус у ЮKassa (не доверяем телу слепо).
  let verified;
  try {
    verified = await getPayment(yooId);
  } catch {
    return NextResponse.json({ error: "verify failed" }, { status: 502 });
  }

  const payment = await prisma.payment.findUnique({ where: { yookassaId: yooId } });
  if (!payment) return NextResponse.json({ ok: true, note: "unknown payment" });

  if (verified.paid && verified.status === "succeeded") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "paid", paidAt: new Date() },
    });
    await prisma.user.update({
      where: { id: payment.userId },
      data: { packageName: payment.packageName },
    });
  } else if (verified.status === "canceled") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    });
  }

  return NextResponse.json({ ok: true });
}
