// Тонкая обёртка над REST API ЮKassa (https://yookassa.ru/developers/api).
import { randomUUID } from "crypto";

const API = "https://api.yookassa.ru/v3";

export function yookassaConfigured(): boolean {
  return !!process.env.YOOKASSA_SHOP_ID && !!process.env.YOOKASSA_SECRET_KEY;
}

function authHeader(): string {
  const token = Buffer.from(
    `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
  ).toString("base64");
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
  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
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
  const res = await fetch(`${API}/payments/${id}`, {
    headers: { Authorization: authHeader() },
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
