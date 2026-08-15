import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ScheduleGrid, type Cell, type CellState } from "@/components/site/ScheduleGrid";
import { addDays, isPast, mondayOf, todayKey, weekDays, weekLabel } from "@/lib/week";

export const metadata = { title: "Онлайн-запись — Paul English" };

const MAX_WEEKS_AHEAD = 8;

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; teacher?: string }>;
}) {
  const { week, teacher } = await searchParams;
  const offset = Math.min(Math.max(parseInt(week ?? "0", 10) || 0, 0), MAX_WEEKS_AHEAD);

  const session = await auth();

  const teachers = await prisma.teamMember.findMany({
    where: { takesBookings: true },
    orderBy: { order: "asc" },
  });

  if (teachers.length === 0) {
    return (
      <div className="page">
        <div className="page__hero">
          <div className="wrap">
            <h1 className="display" style={{ fontSize: "clamp(36px,5vw,64px)" }}>Онлайн-запись</h1>
            <p className="muted" style={{ marginTop: 14 }}>
              Расписание пока не опубликовано. Оставьте заявку — подберём время индивидуально.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeTeacher =
    teachers.find((t) => String(t.id) === teacher) ?? teachers[0];

  const thisMonday = mondayOf(todayKey());
  const monday = addDays(thisMonday, offset * 7);
  const days = weekDays(monday);
  const weekEnd = addDays(monday, 6);

  const [slots, members] = await Promise.all([
    prisma.scheduleSlot.findMany({
      where: { teacherId: activeTeacher.id, date: { gte: monday, lte: weekEnd } },
    }),
    session?.user
      ? prisma.familyMember.findMany({
          where: { userId: session.user.id },
          orderBy: [{ isSelf: "desc" }, { order: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  const times = [...new Set(slots.map((s) => s.time))].sort();
  const cells: Record<string, Cell> = {};
  for (const s of slots) {
    let state: CellState;
    if (s.status === "closed") state = "closed";
    else if (isPast(s.date, s.time)) state = "past";
    else if (s.status === "booked") {
      state = session?.user && s.bookedByUserId === session.user.id ? "mine" : "booked";
    } else state = "free";
    cells[`${s.date}|${s.time}`] = { id: s.id, state };
  }

  const link = (w: number) => `/schedule?week=${w}&teacher=${activeTeacher.id}`;

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
            Свободные окошки педагогов. Нажми на жёлтое — забронируем за тобой, занятие сразу появится в личном кабинете.
          </p>
        </div>
      </div>

      <div className="wrap section--tight">
        {/* выбор преподавателя */}
        {teachers.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <span className="upper muted" style={{ display: "block", marginBottom: 8 }}>Преподаватель</span>
            <div className="bk__chips">
              {teachers.map((t) => (
                <Link
                  key={t.id}
                  href={`/schedule?week=${offset}&teacher=${t.id}`}
                  className="chip"
                  data-on={t.id === activeTeacher.id}
                  style={{ textDecoration: "none" }}
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* навигация по неделям */}
        <div className="row between center gap12" style={{ flexWrap: "wrap", marginBottom: 18 }}>
          <div className="row gap8 center">
            {offset > 0 ? (
              <Link className="btn btn--ghost btn--sm" href={link(offset - 1)}>← Раньше</Link>
            ) : (
              <button className="btn btn--ghost btn--sm" disabled>← Раньше</button>
            )}
            {offset < MAX_WEEKS_AHEAD ? (
              <Link className="btn btn--ghost btn--sm" href={link(offset + 1)}>Позже →</Link>
            ) : (
              <button className="btn btn--ghost btn--sm" disabled>Позже →</button>
            )}
            {offset !== 0 && <Link className="btn btn--sm" href={link(0)}>Эта неделя</Link>}
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

        {times.length === 0 ? (
          <div className="card" style={{ padding: "28px 30px" }}>
            <p style={{ margin: 0, fontSize: 17 }}>
              На эту неделю у преподавателя {activeTeacher.name} расписание ещё не открыто.
            </p>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: 15 }}>
              Посмотрите другую неделю или оставьте заявку — подберём время.
            </p>
          </div>
        ) : (
          <ScheduleGrid
            days={days}
            times={times}
            cells={cells}
            members={members.map((m) => ({ id: m.id, name: m.name, relation: m.relation, isSelf: m.isSelf }))}
            isAuthed={!!session?.user}
          />
        )}
      </div>
    </div>
  );
}
