"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function bookSlot(slotId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Нужно войти в кабинет" };

  const slot = await prisma.scheduleSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.status !== "free") return { ok: false, error: "Слот недоступен" };

  await prisma.scheduleSlot.update({
    where: { id: slotId },
    data: { status: "booked", bookedByUserId: session.user.id },
  });

  revalidatePath("/schedule");
  return { ok: true };
}
