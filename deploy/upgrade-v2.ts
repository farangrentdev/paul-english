/**
 * Разовая донастройка боевых данных под вторую итерацию.
 * Не трогает контент сайта (в отличие от полного сида) — только доводит
 * существующие записи до новой модели:
 *   • педагоги получают участие в записи и стандартное расписание;
 *   • у пакетов проставляется количество занятий;
 *   • у каждого ученика появляется запись «сам» в списке занимающихся;
 *   • по прошлым оплатам создаются пакеты занятий (если их ещё нет).
 *
 * Запуск: docker compose exec -T app npx tsx deploy/upgrade-v2.ts
 * Повторный запуск безопасен.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TIMES = ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30", "19:00", "20:30"];

// Сколько занятий даёт пакет — определяем по названию/сумме.
const LESSONS_BY_NAME: Record<string, number> = {
  "Проба пера": 1,
  "Разогрев": 4,
  "В потоке": 8,
  "Интенсив": 16,
};

async function main() {
  // 1. Пакеты: количество занятий
  const packages = await prisma.package.findMany();
  for (const p of packages) {
    if (p.lessonsCount > 0) continue;
    const guess =
      LESSONS_BY_NAME[p.name] ??
      Number(p.per.match(/(\d+)\s*занят/)?.[1] ?? 0);
    if (guess > 0) {
      await prisma.package.update({ where: { id: p.id }, data: { lessonsCount: guess } });
      console.log(`пакет «${p.name}» → ${guess} занятий`);
    }
  }

  // 2. Педагоги: участие в записи (основатель + все, у кого есть роль)
  const team = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
  const bookable = team.filter((t) => t.takesBookings);
  if (bookable.length === 0) {
    // По умолчанию включаем основателя — остальных Павел отметит сам.
    const founder = team.find((t) => t.hero) ?? team[0];
    if (founder) {
      await prisma.teamMember.update({
        where: { id: founder.id },
        data: { takesBookings: true },
      });
      console.log(`педагог «${founder.name}» участвует в записи`);
    }
  }

  // 3. Стандартное расписание для тех, у кого его нет
  const teachers = await prisma.teamMember.findMany({ where: { takesBookings: true } });
  for (const t of teachers) {
    const has = await prisma.workingSlot.count({ where: { teacherId: t.id } });
    if (has > 0) continue;
    for (let weekday = 1; weekday <= 6; weekday++) {
      const dayTimes = weekday === 6 ? TIMES.slice(0, 4) : TIMES;
      for (const time of dayTimes) {
        await prisma.workingSlot.create({
          data: { teacherId: t.id, weekday, time, enabled: true },
        });
      }
    }
    console.log(`стандартное расписание создано для «${t.name}»`);
  }

  // 4. У каждого ученика — запись «сам»
  const students = await prisma.user.findMany({ where: { role: "student" } });
  for (const s of students) {
    const has = await prisma.familyMember.count({ where: { userId: s.id, isSelf: true } });
    if (has > 0) continue;
    await prisma.familyMember.create({
      data: { userId: s.id, name: s.name, relation: "Сам", isSelf: true, order: 0 },
    });
    console.log(`«${s.name}» добавлен как занимающийся`);
  }

  // 5. Пакеты занятий по оплаченным платежам
  const paid = await prisma.payment.findMany({
    where: { status: "paid" },
    include: { purchase: true },
  });
  for (const pay of paid) {
    if (pay.purchase) continue;
    const pkg = await prisma.package.findFirst({ where: { name: pay.packageName } });
    const total = pkg?.lessonsCount ?? LESSONS_BY_NAME[pay.packageName] ?? 0;
    if (total <= 0) continue;
    await prisma.packagePurchase.create({
      data: {
        userId: pay.userId,
        packageName: pay.packageName,
        lessonsTotal: total,
        paymentId: pay.id,
        note: pay.period || null,
      },
    });
    console.log(`пакет «${pay.packageName}» (${total}) начислен по оплате ${pay.period}`);
  }

  console.log("✓ Донастройка завершена");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
