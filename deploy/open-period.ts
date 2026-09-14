/**
 * Открыть период по стандартному расписанию — то же, что кнопка
 * «Открыть период» в админке, но сразу для всех педагогов, участвующих в записи.
 *
 * Запуск:  npx tsx open-period.ts [недель]     (по умолчанию 4)
 * Повторный запуск безопасен: существующие слоты и брони не трогаются.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const weeks = Math.max(1, Math.min(52, Number(process.argv[2]) || 4));

const TZ = "Europe/Moscow";

function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function weekdayOf(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  const jsDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

async function main() {
  const monday = addDays(todayKey(), -(weekdayOf(todayKey()) - 1));
  const teachers = await prisma.teamMember.findMany({
    where: { takesBookings: true },
    orderBy: { order: "asc" },
  });

  if (teachers.length === 0) {
    console.log("Нет педагогов, участвующих в записи.");
    return;
  }

  console.log(`Открываю ${weeks} нед. с ${monday} для ${teachers.length} педагог(ов)\n`);

  for (const teacher of teachers) {
    const template = await prisma.workingSlot.findMany({
      where: { teacherId: teacher.id, enabled: true },
    });
    if (template.length === 0) {
      console.log(`${teacher.name}: стандартное расписание пустое — пропускаю`);
      continue;
    }

    const byWeekday = new Map<number, string[]>();
    for (const t of template) {
      if (!byWeekday.has(t.weekday)) byWeekday.set(t.weekday, []);
      byWeekday.get(t.weekday)!.push(t.time);
    }

    const rows: { teacherId: number; date: string; time: string; status: string }[] = [];
    for (let w = 0; w < weeks; w++) {
      for (let i = 0; i < 7; i++) {
        const date = addDays(monday, w * 7 + i);
        for (const time of byWeekday.get(i + 1) ?? []) {
          rows.push({ teacherId: teacher.id, date, time, status: "open" });
        }
      }
    }

    const dates = [...new Set(rows.map((r) => r.date))];
    const existing = await prisma.scheduleSlot.findMany({
      where: { teacherId: teacher.id, date: { in: dates } },
      select: { date: true, time: true },
    });
    const seen = new Set(existing.map((e) => `${e.date}|${e.time}`));
    const fresh = rows.filter((r) => !seen.has(`${r.date}|${r.time}`));

    if (fresh.length > 0) await prisma.scheduleSlot.createMany({ data: fresh });

    const total = await prisma.scheduleSlot.count({ where: { teacherId: teacher.id } });
    console.log(`${teacher.name}: создано ${fresh.length}, всего слотов ${total}`);
  }

  console.log(`\n✓ Готово. Период: ${monday} — ${addDays(monday, weeks * 7 - 1)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
