"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isPast, weekdayOf, WEEKDAY_LABELS } from "@/lib/week";
import { getActivePurchase } from "@/lib/packages";

/**
 * Бронь слота учеником. Сразу создаёт занятие в кабинете и у преподавателя,
 * с указанием, кто именно занимается (сам или член семьи).
 */
export async function bookSlot(
  slotId: string,
  memberId?: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Нужно войти в кабинет" };

  const slot = await prisma.scheduleSlot.findUnique({
    where: { id: slotId },
    include: { teacher: true },
  });
  if (!slot) return { ok: false, error: "Слот не найден" };
  if (slot.status !== "open") return { ok: false, error: "Слот уже занят" };
  if (isPast(slot.date, slot.time)) return { ok: false, error: "Это время уже прошло" };

  // Кто занимается: выбранный член семьи либо сам владелец аккаунта.
  let member = null;
  if (memberId) {
    member = await prisma.familyMember.findFirst({
      where: { id: memberId, userId: session.user.id },
    });
    if (!member) return { ok: false, error: "Некорректный участник" };
  } else {
    member = await prisma.familyMember.findFirst({
      where: { userId: session.user.id, isSelf: true },
    });
  }

  const purchase = await getActivePurchase(session.user.id);
  const weekdayLabel = WEEKDAY_LABELS[weekdayOf(slot.date) - 1];
  const [, m, d] = slot.date.split("-");

  try {
    await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          userId: session.user.id,
          memberId: member?.id ?? null,
          teacherId: slot.teacherId,
          purchaseId: purchase?.id ?? null,
          date: slot.date,
          dateLabel: `${weekdayLabel}, ${Number(d)}.${m}`,
          time: slot.time,
          topic: "Занятие",
          status: "plan",
        },
      });
      await tx.scheduleSlot.update({
        where: { id: slot.id, status: "open" },
        data: {
          status: "booked",
          bookedByUserId: session.user.id,
          memberId: member?.id ?? null,
          lessonId: lesson.id,
        },
      });
    });
  } catch {
    return { ok: false, error: "Слот только что заняли" };
  }

  revalidatePath("/schedule");
  revalidatePath("/cabinet");
  return { ok: true };
}

/** Отмена своей записи учеником. */
export async function cancelMyBooking(slotId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Нужно войти" };

  const slot = await prisma.scheduleSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.bookedByUserId !== session.user.id) {
    return { ok: false, error: "Запись не найдена" };
  }

  await prisma.$transaction(async (tx) => {
    if (slot.lessonId) {
      await tx.lesson.delete({ where: { id: slot.lessonId } });
    }
    await tx.scheduleSlot.update({
      where: { id: slot.id },
      data: { status: "open", bookedByUserId: null, memberId: null, lessonId: null },
    });
  });

  revalidatePath("/schedule");
  revalidatePath("/cabinet");
  return { ok: true };
}
