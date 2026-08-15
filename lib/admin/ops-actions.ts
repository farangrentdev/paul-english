"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { syncLessonUsage } from "@/lib/packages";

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("forbidden");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string) => parseInt(String(fd.get(k) ?? "0"), 10) || 0;

// ── Заявки ──
export async function updateLeadStatus(id: string, status: string) {
  await assertAdmin();
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
}

export async function deleteLead(id: string) {
  await assertAdmin();
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
}

// ── Ученики ──
export async function createStudent(formData: FormData) {
  await assertAdmin();
  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");
  if (!email || !password) throw new Error("email и пароль обязательны");
  await prisma.user.create({
    data: {
      email,
      name: str(formData, "name") || email,
      phone: str(formData, "phone") || null,
      packageName: str(formData, "packageName") || null,
      role: "student",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudent(id: string, formData: FormData) {
  await assertAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {
    name: str(formData, "name"),
    phone: str(formData, "phone") || null,
    packageName: str(formData, "packageName") || null,
  };
  const password = str(formData, "password");
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data });
  revalidatePath(`/admin/students/${id}`);
  redirect(`/admin/students/${id}`);
}

export async function deleteStudent(id: string) {
  await assertAdmin();
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/students");
  redirect("/admin/students");
}

// ── Под-сущности ученика ──
export async function addLesson(userId: string, formData: FormData) {
  await assertAdmin();
  await prisma.lesson.create({
    data: {
      userId,
      dateLabel: str(formData, "dateLabel"),
      time: str(formData, "time"),
      topic: str(formData, "topic"),
      status: str(formData, "status") || "plan",
      order: int(formData, "order"),
    },
  });
  revalidatePath(`/admin/students/${userId}`);
}

export async function deleteLesson(userId: string, id: string) {
  await assertAdmin();
  const lesson = await prisma.lesson.findUnique({ where: { id } });
  // Возвращаем занятие в пакет, если оно было списано.
  if (lesson?.countedAt && lesson.purchaseId) {
    await prisma.packagePurchase.update({
      where: { id: lesson.purchaseId },
      data: { lessonsUsed: { decrement: 1 } },
    });
  }
  await prisma.scheduleSlot.updateMany({
    where: { lessonId: id },
    data: { status: "open", bookedByUserId: null, memberId: null, lessonId: null },
  });
  await prisma.lesson.delete({ where: { id } });
  revalidatePath(`/admin/students/${userId}`);
  revalidatePath("/schedule");
}

/** Смена статуса занятия. «Проведено» списывает занятие из пакета. */
export async function setLessonStatus(userId: string, id: string, status: string) {
  await assertAdmin();
  await prisma.lesson.update({ where: { id }, data: { status } });
  await syncLessonUsage(id);
  revalidatePath(`/admin/students/${userId}`);
  revalidatePath("/cabinet");
}

// ── Члены семьи ──
export async function addFamilyMember(userId: string, formData: FormData) {
  await assertAdmin();
  const name = str(formData, "name");
  if (!name) return;
  await prisma.familyMember.create({
    data: {
      userId,
      name,
      relation: str(formData, "relation") || "Другое",
      note: str(formData, "note") || null,
      order: int(formData, "order"),
    },
  });
  revalidatePath(`/admin/students/${userId}`);
}

export async function deleteFamilyMember(userId: string, id: string) {
  await assertAdmin();
  await prisma.familyMember.delete({ where: { id } });
  revalidatePath(`/admin/students/${userId}`);
}

// ── Пакеты ученика ──
export async function addPurchase(userId: string, formData: FormData) {
  await assertAdmin();
  const packageName = str(formData, "packageName");
  const lessonsTotal = int(formData, "lessonsTotal");
  if (!packageName || lessonsTotal <= 0) return;
  await prisma.packagePurchase.create({
    data: {
      userId,
      packageName,
      lessonsTotal,
      lessonsUsed: int(formData, "lessonsUsed"),
      note: str(formData, "note") || null,
    },
  });
  await prisma.user.update({ where: { id: userId }, data: { packageName } });
  revalidatePath(`/admin/students/${userId}`);
  revalidatePath("/cabinet");
}

export async function deletePurchase(userId: string, id: string) {
  await assertAdmin();
  await prisma.packagePurchase.delete({ where: { id } });
  revalidatePath(`/admin/students/${userId}`);
  revalidatePath("/cabinet");
}

export async function addJournal(userId: string, formData: FormData) {
  await assertAdmin();
  await prisma.journalEntry.create({
    data: {
      userId,
      date: str(formData, "date"),
      topic: str(formData, "topic"),
      mark: str(formData, "mark"),
      note: str(formData, "note"),
      order: int(formData, "order"),
    },
  });
  revalidatePath(`/admin/students/${userId}`);
}

export async function deleteJournal(userId: string, id: string) {
  await assertAdmin();
  await prisma.journalEntry.delete({ where: { id } });
  revalidatePath(`/admin/students/${userId}`);
}

export async function addMaterial(userId: string, formData: FormData) {
  await assertAdmin();
  await prisma.studentMaterial.create({
    data: {
      userId,
      tag: str(formData, "tag"),
      title: str(formData, "title"),
      size: str(formData, "size"),
      fileUrl: str(formData, "fileUrl") || null,
      order: int(formData, "order"),
    },
  });
  revalidatePath(`/admin/students/${userId}`);
}

export async function deleteStudentMaterial(userId: string, id: string) {
  await assertAdmin();
  await prisma.studentMaterial.delete({ where: { id } });
  revalidatePath(`/admin/students/${userId}`);
}
