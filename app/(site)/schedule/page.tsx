import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ScheduleGrid } from "@/components/site/ScheduleGrid";

export const metadata = { title: "Онлайн-запись — Pavel English" };

export default async function SchedulePage() {
  const session = await auth();
  const rows = await prisma.scheduleSlot.findMany({
    orderBy: [{ weekOrder: "asc" }, { time: "asc" }],
  });

  const dayMap = new Map<number, { weekOrder: number; dayLabel: string; dateLabel: string }>();
  const timeSet = new Set<string>();
  const slots: Record<string, { id: string; status: string; mine: boolean }> = {};

  for (const s of rows) {
    if (!dayMap.has(s.weekOrder)) {
      dayMap.set(s.weekOrder, { weekOrder: s.weekOrder, dayLabel: s.dayLabel, dateLabel: s.dateLabel });
    }
    timeSet.add(s.time);
    slots[`${s.weekOrder}-${s.time}`] = {
      id: s.id,
      status: s.status,
      mine: !!session?.user && s.bookedByUserId === session.user.id,
    };
  }

  const days = [...dayMap.values()].sort((a, b) => a.weekOrder - b.weekOrder);
  const times = [...timeSet].sort();

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
            Свободные окошки на эту неделю. Нажми на жёлтое — забронируем за тобой. Перенести можно в личном кабинете.
          </p>
        </div>
      </div>

      <div className="wrap section--tight">
        <div className="sch__legend">
          <span><i className="dotfree"></i> свободно</span>
          <span><i className="dotbusy"></i> занято</span>
          <span><i className="dotmine"></i> твоё занятие</span>
          <span style={{ marginLeft: "auto" }} className="hand">неделя 2–7 июня</span>
        </div>

        <ScheduleGrid days={days} times={times} slots={slots} isAuthed={!!session?.user} />
      </div>
    </div>
  );
}
