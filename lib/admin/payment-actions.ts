"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { encryptSecret, decryptSecret } from "@/lib/crypto";
import { verifyCredentials } from "@/lib/yookassa";

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("forbidden");
}

export type PaymentFormState = { ok?: string; error?: string };

/**
 * Сохранение реквизитов ЮKassa.
 * Секретный ключ шифруется; пустое поле означает «оставить прежний».
 */
export async function savePaymentSettings(
  _prev: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  await assertAdmin();

  const shopId = String(formData.get("shopId") ?? "").trim();
  const secretKey = String(formData.get("secretKey") ?? "").trim();
  const liveMode = formData.get("liveMode") === "on";
  const enabled = formData.get("enabled") === "on";

  const current = await prisma.paymentSettings.findUnique({ where: { id: 1 } });

  if (enabled && !shopId) {
    return { error: "Укажите shopId — без него приём платежей не включить" };
  }
  const keyToUse = secretKey || decryptSecret(current?.secretKeyEnc);
  if (enabled && !keyToUse) {
    return { error: "Укажите секретный ключ — без него приём платежей не включить" };
  }

  // Перед включением убеждаемся, что ЮKassa принимает реквизиты.
  let checkOk: boolean | null = null;
  let checkError: string | null = null;
  if (enabled && shopId && keyToUse) {
    const res = await verifyCredentials({ shopId, secretKey: keyToUse });
    checkOk = res.ok;
    checkError = res.ok ? null : res.error;
    if (!res.ok) {
      await prisma.paymentSettings.upsert({
        where: { id: 1 },
        update: { shopId, liveMode, enabled: false, lastCheckedAt: new Date(), lastCheckOk: false, lastCheckError: checkError },
        create: { id: 1, shopId, liveMode, enabled: false, lastCheckedAt: new Date(), lastCheckOk: false, lastCheckError: checkError },
      });
      revalidatePath("/admin/payment-settings");
      return { error: `Реквизиты не приняты: ${checkError}. Приём платежей не включён.` };
    }
  }

  const data = {
    shopId,
    liveMode,
    enabled,
    lastCheckedAt: checkOk === null ? current?.lastCheckedAt ?? null : new Date(),
    lastCheckOk: checkOk === null ? current?.lastCheckOk ?? null : checkOk,
    lastCheckError: checkOk === null ? current?.lastCheckError ?? null : checkError,
    ...(secretKey ? { secretKeyEnc: encryptSecret(secretKey) } : {}),
  };

  await prisma.paymentSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  revalidatePath("/admin/payment-settings");
  return {
    ok: enabled
      ? "Реквизиты сохранены и проверены. Приём платежей включён."
      : "Сохранено. Приём платежей выключен — оплата работает в демо-режиме.",
  };
}

/** Проверка сохранённых реквизитов без изменения настроек. */
export async function checkPaymentSettings(): Promise<PaymentFormState> {
  await assertAdmin();

  const settings = await prisma.paymentSettings.findUnique({ where: { id: 1 } });
  const shopId = settings?.shopId || process.env.YOOKASSA_SHOP_ID || "";
  const secretKey = decryptSecret(settings?.secretKeyEnc) || process.env.YOOKASSA_SECRET_KEY || "";

  if (!shopId || !secretKey) {
    return { error: "Реквизиты не заданы" };
  }

  const res = await verifyCredentials({ shopId, secretKey });
  await prisma.paymentSettings.upsert({
    where: { id: 1 },
    update: { lastCheckedAt: new Date(), lastCheckOk: res.ok, lastCheckError: res.ok ? null : res.error },
    create: { id: 1, shopId, lastCheckedAt: new Date(), lastCheckOk: res.ok, lastCheckError: res.ok ? null : res.error },
  });

  revalidatePath("/admin/payment-settings");
  return res.ok ? { ok: "Связь с ЮKassa есть, реквизиты верные." } : { error: res.error };
}

/** Полное удаление сохранённых реквизитов. */
export async function clearPaymentSettings() {
  await assertAdmin();
  await prisma.paymentSettings.upsert({
    where: { id: 1 },
    update: { shopId: "", secretKeyEnc: null, enabled: false, lastCheckedAt: null, lastCheckOk: null, lastCheckError: null },
    create: { id: 1 },
  });
  revalidatePath("/admin/payment-settings");
}
