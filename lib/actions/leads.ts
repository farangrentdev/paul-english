"use server";

import { prisma } from "@/lib/db";
import { stringifyList } from "@/lib/json";

export type LeadInput = {
  name: string;
  contact: string; // Telegram | WhatsApp | Звонок | Email
  contactVal: string;
  level: string;
  goals: string[];
  days: string[];
  time: string;
};

export async function createLead(input: LeadInput): Promise<{ ok: boolean }> {
  const name = (input.name ?? "").trim();
  const contactValue = (input.contactVal ?? "").trim();
  if (!name || !contactValue) return { ok: false };

  await prisma.lead.create({
    data: {
      name,
      contactType: input.contact || "Telegram",
      contactValue,
      level: input.level || null,
      goals: stringifyList(input.goals ?? []),
      days: stringifyList(input.days ?? []),
      time: input.time || null,
    },
  });

  return { ok: true };
}
