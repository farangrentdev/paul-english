// Работа с неделями для календаря записи.
// Даты храним строками "YYYY-MM-DD" — без сюрпризов с часовыми поясами.

export const TZ = "Europe/Moscow";

const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/** "YYYY-MM-DD" в таймзоне школы. */
export function toDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Сегодняшняя дата школы как "YYYY-MM-DD". */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Текущее время школы как "HH:MM". */
export function nowTime(): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function parseKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m, d };
}

/** ISO-день недели (1=Пн … 7=Вс) для "YYYY-MM-DD". */
export function weekdayOf(key: string): number {
  const { y, m, d } = parseKey(key);
  const jsDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Вс
  return jsDay === 0 ? 7 : jsDay;
}

/** Сдвиг даты на N дней. */
export function addDays(key: string, days: number): string {
  const { y, m, d } = parseKey(key);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Понедельник недели, в которую попадает дата. */
export function mondayOf(key: string): string {
  return addDays(key, -(weekdayOf(key) - 1));
}

/** Дни недели, начиная с понедельника: [{ key, weekday, dayLabel, dateLabel }]. */
export function weekDays(mondayKey: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(mondayKey, i);
    const { m, d } = parseKey(key);
    return {
      key,
      weekday: i + 1,
      dayLabel: WEEKDAY_LABELS[i],
      dateLabel: `${d}.${String(m).padStart(2, "0")}`,
    };
  });
}

/** Человеческая подпись недели: «15–21 августа» / «29 сентября — 5 октября». */
export function weekLabel(mondayKey: string): string {
  const start = parseKey(mondayKey);
  const end = parseKey(addDays(mondayKey, 6));
  const startMonth = MONTHS_GEN[start.m - 1];
  const endMonth = MONTHS_GEN[end.m - 1];
  return start.m === end.m
    ? `${start.d}–${end.d} ${endMonth}`
    : `${start.d} ${startMonth} — ${end.d} ${endMonth}`;
}

/** Слот уже прошёл? (сравниваем в таймзоне школы) */
export function isPast(dateKey: string, time: string): boolean {
  const today = todayKey();
  if (dateKey < today) return true;
  if (dateKey > today) return false;
  return time <= nowTime();
}
