import type { Entity, Field } from "@/lib/admin/config";
import { jsonToLines, parseList, parsePairs } from "@/lib/json";

type Rec = Record<string, unknown>;

// Значения записи → строки/булевы для формы редактирования.
export function valuesFromRecord(fields: Field[], rec: Rec): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const f of fields) {
    const v = rec[f.name];
    if (f.type === "checkbox") out[f.name] = !!v;
    else if (f.type === "number") out[f.name] = String(v ?? 0);
    else if (f.type === "list") out[f.name] = jsonToLines(v as string);
    else if (f.type === "pairs") out[f.name] = parsePairs(v as string).map((p) => `${p.label} | ${p.url}`).join("\n");
    else out[f.name] = String(v ?? "");
  }
  return out;
}

// Значение колонки для таблицы списка.
export function cellValue(entity: Entity, rec: Rec, name: string): string {
  const field = entity.fields.find((f) => f.name === name);
  const v = rec[name];
  if (field?.type === "checkbox" || typeof v === "boolean") return v ? "✓" : "—";
  if (field?.type === "list") return parseList(v as string).join(", ");
  const s = String(v ?? "");
  return s.length > 80 ? s.slice(0, 80) + "…" : s;
}
