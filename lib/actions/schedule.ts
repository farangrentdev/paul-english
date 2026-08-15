"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isPast, weekdayOf } from "@/lib/week";

export async function bookSlot(
  date: string,
  time: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Нужно войти в кабинет" };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { ok: false, error: "Некорректный слот" };
  }
  if (isPast(date, time)) return { ok: false, error: "Это время уже прошло" };

  // Слот должен существовать в шаблоне рабочей недели.
  const template = await prisma.workingSlot.findUnique({
    where: { weekday_time: { weekday: weekdayOf(date), time } },
  });
  if (!template || !template.enabled) {
    return { ok: false, error: "В это время занятий нет" };
  }

  // Уже занято?
  const existing = await prisma.scheduleSlot.findUnique({
    where: { date_time: { date, time } },
  });
  if (existing) return { ok: false, error: "Слот уже занят" };

  try {
    await prisma.scheduleSlot.create({
      data: { date, time, status: "booked", bookedByUserId: session.user.id },
    });
  } catch {
    // гонка: кто-то успел забронировать между проверкой и записью
    return { ok: false, error: "Слот только что заняли" };
  }

  revalidatePath("/schedule");
  return { ok: true };
}
