"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { addDays, weekDays } from "@/lib/week";

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("forbidden");
}

function refresh() {
  revalidatePath("/admin/schedule");
  revalidatePath("/schedule");
}

/**
 * Открыть период по стандартному расписанию преподавателя.
 * Создаёт недостающие слоты; существующие (в т.ч. брони и снятые) не трогает.
 */
export async function openPeriod(
  teacherId: number,
  mondayKey: string,
  weeks: number
): Promise<{ created: number }> {
  await assertAdmin();

  const template = await prisma.workingSlot.findMany({
    where: { teacherId, enabled: true },
  });
  if (template.length === 0) return { created: 0 };

  const byWeekday = new Map<number, string[]>();
  for (const t of template) {
    if (!byWeekday.has(t.weekday)) byWeekday.set(t.weekday, []);
    byWeekday.get(t.weekday)!.push(t.time);
  }

  const rows: { teacherId: number; date: string; time: string; status: string }[] = [];
  for (let w = 0; w < weeks; w++) {
    for (const day of weekDays(addDays(mondayKey, w * 7))) {
      for (const time of byWeekday.get(day.weekday) ?? []) {
        rows.push({ teacherId, date: day.key, time, status: "open" });
      }
    }
  }
  if (rows.length === 0) return { created: 0 };

  // Пропускаем уже существующие слоты: повторный запуск не сбрасывает
  // брони и снятые окна. (SQLite не умеет skipDuplicates, фильтруем сами.)
  const dates = [...new Set(rows.map((r) => r.date))];
  const existing = await prisma.scheduleSlot.findMany({
    where: { teacherId, date: { in: dates } },
    select: { date: true, time: true },
  });
  const seen = new Set(existing.map((e) => `${e.date}|${e.time}`));
  const fresh = rows.filter((r) => !seen.has(`${r.date}|${r.time}`));
  if (fresh.length === 0) return { created: 0 };

  const res = await prisma.scheduleSlot.createMany({ data: fresh });
  refresh();
  return { created: res.count };
}

/** Снять слот (сделать недоступным) или вернуть его в продажу. */
export async function toggleSlotAvailability(slotId: string) {
  await assertAdmin();
  const slot = await prisma.scheduleSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.status === "booked") return; // забронированные снимаются отдельно
  await prisma.scheduleSlot.update({
    where: { id: slotId },
    data: { status: slot.status === "open" ? "closed" : "open" },
  });
  refresh();
}

/** Создать одиночный слот вне стандартного расписания. */
export async function addSingleSlot(teacherId: number, date: string, time: string) {
  await assertAdmin();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return;
  await prisma.scheduleSlot.upsert({
    where: { teacherId_date_time: { teacherId, date, time } },
    update: { status: "open" },
    create: { teacherId, date, time, status: "open" },
  });
  refresh();
}

/** Закрыть весь день преподавателя (например, отпуск). */
export async function closeDay(teacherId: number, date: string) {
  await assertAdmin();
  await prisma.scheduleSlot.updateMany({
    where: { teacherId, date, status: "open" },
    data: { status: "closed" },
  });
  refresh();
}

/** Открыть все снятые слоты дня обратно. */
export async function openDay(teacherId: number, date: string) {
  await assertAdmin();
  await prisma.scheduleSlot.updateMany({
    where: { teacherId, date, status: "closed" },
    data: { status: "open" },
  });
  refresh();
}

/** Снять бронь: слот освобождается, связанное занятие удаляется. */
export async function cancelBooking(slotId: string) {
  await assertAdmin();
  const slot = await prisma.scheduleSlot.findUnique({ where: { id: slotId } });
  if (!slot) return;
  await prisma.$transaction(async (tx) => {
    if (slot.lessonId) await tx.lesson.delete({ where: { id: slot.lessonId } });
    await tx.scheduleSlot.update({
      where: { id: slotId },
      data: { status: "open", bookedByUserId: null, memberId: null, lessonId: null },
    });
  });
  refresh();
}

// ── Стандартное расписание (шаблон) преподавателя ──

export async function toggleWorkingSlot(teacherId: number, weekday: number, time: string) {
  await assertAdmin();
  const existing = await prisma.workingSlot.findUnique({
    where: { teacherId_weekday_time: { teacherId, weekday, time } },
  });
  if (existing) {
    await prisma.workingSlot.update({
      where: { id: existing.id },
      data: { enabled: !existing.enabled },
    });
  } else {
    await prisma.workingSlot.create({ data: { teacherId, weekday, time, enabled: true } });
  }
  refresh();
}

export async function addWorkingTime(teacherId: number, formData: FormData) {
  await assertAdmin();
  const time = String(formData.get("time") ?? "").trim();
  if (!/^\d{2}:\d{2}$/.test(time)) return;
  for (let weekday = 1; weekday <= 5; weekday++) {
    await prisma.workingSlot.upsert({
      where: { teacherId_weekday_time: { teacherId, weekday, time } },
      update: { enabled: true },
      create: { teacherId, weekday, time, enabled: true },
    });
  }
  refresh();
}

export async function removeWorkingTime(teacherId: number, time: string) {
  await assertAdmin();
  await prisma.workingSlot.deleteMany({ where: { teacherId, time } });
  refresh();
}
