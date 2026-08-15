/**
 * Короткое имя для кнопки входа: «Анна В.».
 * Если фамилии нет — только имя. Если имени нет — часть email до @.
 */
export function shortName(name?: string | null, email?: string | null): string {
  const full = (name ?? "").trim();
  if (!full) {
    const local = (email ?? "").split("@")[0];
    return local || "Кабинет";
  }
  const [first, second] = full.split(/\s+/);
  if (!second) return first;
  return `${first} ${second[0].toUpperCase()}.`;
}
