import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ScheduleGrid, type SlotState } from "@/components/site/ScheduleGrid";
import { addDays, isPast, mondayOf, todayKey, weekDays, weekLabel } from "@/lib/week";

export const metadata = { title: "Онлайн-запись — Paul English" };

// Насколько вперёд можно записаться.
const MAX_WEEKS_AHEAD = 8;

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const offset = Math.min(Math.max(parseInt(week ?? "0", 10) || 0, 0), MAX_WEEKS_AHEAD);

  const session = await auth();
  const thisMonday = mondayOf(todayKey());
  const monday = addDays(thisMonday, offset * 7);
  const days = weekDays(monday);
  const weekEnd = addDays(monday, 6);

  const [template, booked] = await Promise.all([
    prisma.workingSlot.findMany({ where: { enabled: true }, orderBy: { time: "asc" } }),
    prisma.scheduleSlot.findMany({
      where: { date: { gte: monday, lte: weekEnd } },
    }),
  ]);

  // Времена — объединение всех «окошек» шаблона.
  const times = [...new Set(template.map((t) => t.time))].sort();
  const openByWeekday = new Map<number, Set<string>>();
  for (const t of template) {
    if (!openByWeekday.has(t.weekday)) openByWeekday.set(t.weekday, new Set());
    openByWeekday.get(t.weekday)!.add(t.time);
  }
  const bookedMap = new Map(booked.map((b) => [`${b.date}|${b.time}`, b]));

  const states: Record<string, SlotState> = {};
  for (const d of days) {
    for (const t of times) {
      const k = `${d.key}|${t}`;
      if (!openByWeekday.get(d.weekday)?.has(t)) {
        states[k] = "none";
      } else if (isPast(d.key, t)) {
        states[k] = "past";
      } else {
        const b = bookedMap.get(k);
        if (!b) states[k] = "free";
        else if (session?.user && b.bookedByUserId === session.user.id) states[k] = "mine";
        else states[k] = "booked";
      }
    }
  }

  return (
    <div className="page">
      <div className="page__hero">
        <div className="wrap">
          <span className="kicker" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 30, height: 2, background: "var(--ink)" }}></span> Онлайн-запись
          </span>
          <h1 className="display" style={{ fontSize: "clamp(40px,6vw,76px)", lineHeight: 0.95 }}>
            Выбери <span className="hl">слот</span> — <span className="ital">и готово</span>
          </h1>
          <p className="muted" style={{ fontSize: 18, marginTop: 14, maxWidth: "34em" }}>
            Свободные окошки на ближайшие недели. Нажми на жёлтое — забронируем за тобой. Перенести можно в личном кабинете.
          </p>
        </div>
      </div>

      <div className="wrap section--tight">
        {/* навигация по неделям */}
        <div className="row between center gap12" style={{ flexWrap: "wrap", marginBottom: 18 }}>
          <div className="row gap8 center">
            {offset > 0 ? (
              <Link className="btn btn--ghost btn--sm" href={`/schedule?week=${offset - 1}`}>← Раньше</Link>
            ) : (
              <button className="btn btn--ghost btn--sm" disabled>← Раньше</button>
            )}
            {offset < MAX_WEEKS_AHEAD ? (
              <Link className="btn btn--ghost btn--sm" href={`/schedule?week=${offset + 1}`}>Позже →</Link>
            ) : (
              <button className="btn btn--ghost btn--sm" disabled>Позже →</button>
            )}
            {offset !== 0 && (
              <Link className="btn btn--sm" href="/schedule">Эта неделя</Link>
            )}
          </div>
          <div className="hand" style={{ fontSize: 22 }}>
            {offset === 0 ? "эта неделя · " : ""}{weekLabel(monday)}
          </div>
        </div>

        <div className="sch__legend">
          <span><i className="dotfree"></i> свободно</span>
          <span><i className="dotbusy"></i> занято</span>
          <span><i className="dotmine"></i> твоё занятие</span>
        </div>

        <ScheduleGrid days={days} times={times} states={states} isAuthed={!!session?.user} />
      </div>
    </div>
  );
}
