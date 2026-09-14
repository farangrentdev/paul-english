// Тонкая обёртка над REST API ЮKassa (https://yookassa.ru/developers/api).
// Ключи берутся из настроек в админке; если их там нет — из переменных окружения.
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto";

const API = "https://api.yookassa.ru/v3";

export type YooCredentials = { shopId: string; secretKey: string };

/** Действующие реквизиты: сначала админка, затем .env. */
export async function getCredentials(): Promise<YooCredentials | null> {
  const settings = await prisma.paymentSettings.findUnique({ where: { id: 1 } });

  if (settings?.enabled && settings.shopId) {
    const secretKey = decryptSecret(settings.secretKeyEnc);
    if (secretKey) return { shopId: settings.shopId, secretKey };
  }

  // Совместимость со старым способом настройки.
  const envShop = process.env.YOOKASSA_SHOP_ID;
  const envSecret = process.env.YOOKASSA_SECRET_KEY;
  if (envShop && envSecret) return { shopId: envShop, secretKey: envSecret };

  return null;
}

/** Настроен ли приём платежей. Без него оплата работает в демо-режиме. */
export async function yookassaConfigured(): Promise<boolean> {
  return (await getCredentials()) !== null;
}

function authHeader(creds: YooCredentials): string {
  const token = Buffer.from(`${creds.shopId}:${creds.secretKey}`).toString("base64");
  return `Basic ${token}`;
}

function rub(amount: number): string {
  return amount.toFixed(2);
}

export type YooPayment = {
  id: string;
  status: string;
  paid: boolean;
  confirmationUrl?: string;
  metadata?: Record<string, string>;
};

export async function createPayment(params: {
  amount: number;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
}): Promise<YooPayment> {
  const creds = await getCredentials();
  if (!creds) throw new Error("ЮKassa не настроена");

  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(creds),
      "Idempotence-Key": randomUUID(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { value: rub(params.amount), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: params.returnUrl },
      description: params.description,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ЮKassa createPayment failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    status: data.status,
    paid: !!data.paid,
    confirmationUrl: data.confirmation?.confirmation_url,
    metadata: data.metadata,
  };
}

export async function getPayment(id: string): Promise<YooPayment> {
  const creds = await getCredentials();
  if (!creds) throw new Error("ЮKassa не настроена");

  const res = await fetch(`${API}/payments/${id}`, {
    headers: { Authorization: authHeader(creds) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ЮKassa getPayment failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return {
    id: data.id,
    status: data.status,
    paid: !!data.paid,
    metadata: data.metadata,
  };
}

/**
 * Проверка реквизитов: запрашиваем список платежей.
 * Успешный ответ означает, что shopId и ключ приняты ЮKassa.
 */
export async function verifyCredentials(
  creds: YooCredentials
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API}/payments?limit=1`, {
      headers: { Authorization: authHeader(creds) },
    });
    if (res.ok) return { ok: true };
    if (res.status === 401) return { ok: false, error: "Неверный shopId или секретный ключ" };
    const text = await res.text();
    return { ok: false, error: `ЮKassa ответила ${res.status}: ${text.slice(0, 200)}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Нет связи с ЮKassa" };
  }
}
