"use server";

import { writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getEntity, SETTINGS_FIELDS, type Field } from "@/lib/admin/config";
import { stringifyList } from "@/lib/json";

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("forbidden");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function delegate(model: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[model];
}

async function saveUpload(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}-${safe}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/${filename}`;
}

async function buildData(fields: Field[], formData: FormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};
  for (const f of fields) {
    if (f.type === "checkbox") {
      data[f.name] = formData.get(f.name) === "on";
    } else if (f.type === "number") {
      data[f.name] = parseInt(String(formData.get(f.name) ?? "0"), 10) || 0;
    } else if (f.type === "list") {
      const lines = String(formData.get(f.name) ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      data[f.name] = stringifyList(lines);
    } else if (f.type === "pairs") {
      const pairs = String(formData.get(f.name) ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [label, url] = l.split("|").map((x) => x.trim());
          return { label: label ?? "", url: url ?? "" };
        });
      data[f.name] = JSON.stringify(pairs);
    } else if (f.type === "image") {
      const file = formData.get(f.name);
      if (file instanceof File && file.size > 0) {
        data[f.name] = await saveUpload(file);
      } else {
        const current = String(formData.get(`__current_${f.name}`) ?? "");
        if (current) data[f.name] = current;
        else if (!f.optional) data[f.name] = null;
      }
    } else {
      const v = String(formData.get(f.name) ?? "");
      data[f.name] = v;
    }
  }
  return data;
}

function revalidatePublic() {
  revalidatePath("/", "layout");
}

export async function createEntity(key: string, formData: FormData) {
  await assertAdmin();
  const entity = getEntity(key);
  if (!entity) throw new Error("unknown entity");
  const data = await buildData(entity.fields, formData);
  await delegate(entity.model).create({ data });
  revalidatePublic();
  redirect(`/admin/${key}`);
}

export async function updateEntity(key: string, id: string, formData: FormData) {
  await assertAdmin();
  const entity = getEntity(key);
  if (!entity) throw new Error("unknown entity");
  const data = await buildData(entity.fields, formData);
  const where = { id: isNaN(Number(id)) ? id : Number(id) };
  await delegate(entity.model).update({ where, data });
  revalidatePublic();
  redirect(`/admin/${key}`);
}

export async function updateSettings(formData: FormData) {
  await assertAdmin();
  const data = await buildData(SETTINGS_FIELDS, formData);
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  revalidatePublic();
  redirect("/admin/settings");
}

export async function deleteEntity(key: string, id: string) {
  await assertAdmin();
  const entity = getEntity(key);
  if (!entity) throw new Error("unknown entity");
  const where = { id: isNaN(Number(id)) ? id : Number(id) };
  await delegate(entity.model).delete({ where });
  revalidatePublic();
  redirect(`/admin/${key}`);
}
