// Хелперы для list-полей, которые в SQLite хранятся как JSON-строки.

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function parsePairs(
  value: string | null | undefined
): { label: string; url: string }[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === "object")
      .map((x) => ({ label: String(x.label ?? ""), url: String(x.url ?? "") }));
  } catch {
    return [];
  }
}

export function stringifyList(items: string[]): string {
  return JSON.stringify(items.filter((x) => x.trim() !== ""));
}

// Разбивает textarea (по строкам) в JSON-массив строк.
export function linesToJson(text: string): string {
  return stringifyList(
    text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
  );
}

export function jsonToLines(value: string | null | undefined): string {
  return parseList(value).join("\n");
}
