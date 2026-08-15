import Link from "next/link";
import { prisma } from "@/lib/db";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { OpenPeriodForm } from "@/components/admin/OpenPeriodForm";
import {
  toggleSlotAvailability,
  closeDay,
  openDay,
  cancelBooking,
  toggleWorkingSlot,
  addWorkingTime,
  removeWorkingTime,
} from "@/lib/admin/schedule-actions";
import {
  addDays,
  mondayOf,
  todayKey,
  weekDays,
  weekLabel,
  WEEKDAY_LABELS,
} from "@/lib/week";

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ teacher?: string; week?: string; tab?: string }>;
}) {
  const { teacher, week, tab } = await searchParams;
  const offset = Math.max(parseInt(week ?? "0", 10) || 0, 0);
  const showTemplate = tab === "template";

  const teachers = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
  const bookable = teachers.filter((t) => t.takesBookings);

  if (bookable.length === 0) {
    return (
      <>
        <div className="admin__head">
          <div>
            <h1>Расписание</h1>
            <p className="admin__sub">Ни один педагог не участвует в онлайн-записи.</p>
          </div>
        </div>
        <div className="card" style={{ padding: "24px 26px" }}>
          <p style={{ marginTop: 0 }}>
            Откройте раздел <Link href="/admin/team">Педагоги</Link>, отредактируйте нужного человека
            и включите галочку <b>«Участвует в онлайн-записи»</b>. После этого здесь появится его расписание.
          </p>
        </div>
      </>
    );
  }

  const active = bookable.find((t) => String(t.id) === teacher) ?? bookable[0];
  const monday = addDays(mondayOf(todayKey()), offset * 7);
  const days = weekDays(monday);
  const weekEnd = addDays(monday, 6);

  const [slots, template, bookings] = await Promise.all([
    prisma.scheduleSlot.findMany({
      where: { teacherId: active.id, date: { gte: monday, lte: weekEnd } },
      include: { bookedBy: true, member: true },
    }),
    prisma.workingSlot.findMany({
      where: { teacherId: active.id },
      orderBy: [{ time: "asc" }, { weekday: "asc" }],
    }),
    prisma.scheduleSlot.findMany({
      where: { teacherId: active.id, status: "booked", date: { gte: todayKey() } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      include: { bookedBy: true, member: true },
      take: 60,
    }),
  ]);

  const times = [...new Set(slots.map((s) => s.time))].sort();
  const byKey = new Map(slots.map((s) => [`${s.date}|${s.time}`, s]));

  const templateTimes = [...new Set(template.map((t) => t.time))].sort();
  const templateOn = new Map(template.map((t) => [`${t.weekday}|${t.time}`, t.enabled]));

  const link = (params: { week?: number; tab?: string; teacher?: number }) => {
    const w = params.week ?? offset;
    const t = params.teacher ?? active.id;
    const tb = params.tab ?? (showTemplate ? "template" : "");
    return `/admin/schedule?teacher=${t}&week=${w}${tb ? `&tab=${tb}` : ""}`;
  };

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Расписание</h1>
          <p className="admin__sub">
            Откройте период по стандартному расписанию педагога, затем снимите занятые окна.
          </p>
        </div>
      </div>

      {/* выбор преподавателя */}
      <div style={{ marginBottom: 16 }}>
        <span className="upper muted" style={{ display: "block", marginBottom: 8 }}>Преподаватель</span>
        <div className="bk__chips">
          {bookable.map((t) => (
            <Link
              key={t.id}
              href={link({ teacher: t.id, week: 0 })}
              className="chip"
              data-on={t.id === active.id}
              style={{ textDecoration: "none" }}
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>

      {/* вкладки */}
      <div className="leg__tabs" style={{ marginBottom: 20 }}>
        <Link href={link({ tab: "" })} className={"leg__tab" + (!showTemplate ? " on" : "")} style={{ textDecoration: "none" }}>
          Календарь
        </Link>
        <Link href={link({ tab: "template" })} className={"leg__tab" + (showTemplate ? " on" : "")} style={{ textDecoration: "none" }}>
          Стандартное расписание
        </Link>
      </div>

      {showTemplate ? (
        <>
          <p className="muted" style={{ marginTop: -6, marginBottom: 14, fontSize: 14 }}>
            Это шаблон недели педагога <b>{active.name}</b>. По нему открывается период в календаре.
            Клик по ячейке включает или выключает окошко.
          </p>

          <table className="atable" style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                <th>Время</th>
                {WEEKDAY_LABELS.map((d) => (
                  <th key={d} style={{ textAlign: "center" }}>{d}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {templateTimes.length === 0 && (
                <tr><td colSpan={9} className="muted">Стандартных часов пока нет — добавьте время ниже</td></tr>
              )}
              {templateTimes.map((t) => (
                <tr key={t}>
                  <td className="mono-num"><b>{t}</b></td>
                  {WEEKDAY_LABELS.map((_, i) => {
                    const weekday = i + 1;
                    const on = templateOn.get(`${weekday}|${t}`) ?? false;
                    return (
                      <td key={weekday} style={{ textAlign: "center" }}>
                        <form action={toggleWorkingSlot.bind(null, active.id, weekday, t)}>
                          <button
                            className={"btn btn--sm " + (on ? "btn--accent" : "btn--ghost")}
                            style={{ width: "100%", justifyContent: "center", minWidth: 52 }}
                          >
                            {on ? "✓" : "—"}
                          </button>
                        </form>
                      </td>
                    );
                  })}
                  <td className="actions">
                    <ConfirmSubmit
                      action={removeWorkingTime.bind(null, active.id, t)}
                      confirmText={`Убрать ${t} из стандартного расписания ${active.name}?`}
                      style={{ color: "#c0392b" }}
                    >
                      Убрать
                    </ConfirmSubmit>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <form action={addWorkingTime.bind(null, active.id)} className="row gap12 center" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ maxWidth: 160 }}>
              <label>Новое время</label>
              <input className="input mono-num" name="time" placeholder="19:00" pattern="[0-9]{2}:[0-9]{2}" required />
            </div>
            <button className="btn btn--ink btn--sm" style={{ marginTop: 22 }}>+ Добавить в будни</button>
          </form>
        </>
      ) : (
        <>
          <OpenPeriodForm teacherId={active.id} monday={monday} weekLabelText={weekLabel(monday)} />

          {/* навигация по неделям */}
          <div className="row between center gap12" style={{ flexWrap: "wrap", marginBottom: 16 }}>
            <div className="row gap8 center">
              <Link className="btn btn--ghost btn--sm" href={link({ week: Math.max(0, offset - 1) })}>← Раньше</Link>
              <Link className="btn btn--ghost btn--sm" href={link({ week: offset + 1 })}>Позже →</Link>
              {offset !== 0 && <Link className="btn btn--sm" href={link({ week: 0 })}>Эта неделя</Link>}
            </div>
            <b style={{ fontSize: 17 }}>{weekLabel(monday)}</b>
          </div>

          {times.length === 0 ? (
            <div className="card" style={{ padding: "24px 26px" }}>
              <p style={{ margin: 0 }}>
                На эту неделю слотов нет. Нажмите <b>«Открыть период»</b> выше — они создадутся
                по стандартному расписанию педагога.
              </p>
            </div>
          ) : (
            <>
              <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
                Клик по слоту снимает его с продажи или возвращает обратно. Забронированные снимаются
                в списке ниже.
              </p>
              <table className="atable" style={{ marginBottom: 14 }}>
                <thead>
                  <tr>
                    <th>Время</th>
                    {days.map((d) => (
                      <th key={d.key} style={{ textAlign: "center" }}>
                        {d.dayLabel}<br />
                        <span className="muted" style={{ fontWeight: 400 }}>{d.dateLabel}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map((t) => (
                    <tr key={t}>
                      <td className="mono-num"><b>{t}</b></td>
                      {days.map((d) => {
                        const slot = byKey.get(`${d.key}|${t}`);
                        if (!slot) return <td key={d.key} className="muted" style={{ textAlign: "center" }}>·</td>;
                        if (slot.status === "booked") {
                          return (
                            <td key={d.key} style={{ textAlign: "center" }}>
                              <span className="badge badge--new" title={slot.bookedBy?.email ?? ""}>
                                {slot.member?.name ?? slot.bookedBy?.name ?? "занято"}
                              </span>
                            </td>
                          );
                        }
                        const isOpen = slot.status === "open";
                        return (
                          <td key={d.key} style={{ textAlign: "center" }}>
                            <form action={toggleSlotAvailability.bind(null, slot.id)}>
                              <button
                                className={"btn btn--sm " + (isOpen ? "btn--accent" : "btn--ghost")}
                                style={{ width: "100%", justifyContent: "center", minWidth: 52 }}
                                title={isOpen ? "открыт для записи" : "снят"}
                              >
                                {isOpen ? "✓" : "—"}
                              </button>
                            </form>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="muted" style={{ fontSize: 12 }}>день</td>
                    {days.map((d) => (
                      <td key={d.key} style={{ textAlign: "center" }}>
                        <form action={closeDay.bind(null, active.id, d.key)} style={{ display: "inline" }}>
                          <button className="linklike" style={{ fontSize: 12 }}>снять</button>
                        </form>
                        {" / "}
                        <form action={openDay.bind(null, active.id, d.key)} style={{ display: "inline" }}>
                          <button className="linklike" style={{ fontSize: 12 }}>вернуть</button>
                        </form>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </>
          )}

          <h2 className="serif" style={{ fontSize: 24, margin: "28px 0 12px" }}>
            Записи к {active.name}
          </h2>
          <table className="atable">
            <thead>
              <tr><th>Дата</th><th>Время</th><th>Кто занимается</th><th>Аккаунт</th><th></th></tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr><td colSpan={5} className="muted">Записей пока нет</td></tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="mono-num">{b.date}</td>
                  <td className="mono-num"><b>{b.time}</b></td>
                  <td>
                    <b>{b.member?.name ?? b.bookedBy?.name ?? "—"}</b>
                    {b.member && !b.member.isSelf && (
                      <><br /><span className="muted">{b.member.relation}{b.member.note ? ` · ${b.member.note}` : ""}</span></>
                    )}
                  </td>
                  <td className="muted">{b.bookedBy?.email ?? "—"}</td>
                  <td className="actions">
                    <ConfirmSubmit
                      action={cancelBooking.bind(null, b.id)}
                      confirmText="Снять запись? Занятие удалится, слот снова станет свободным."
                      style={{ color: "#c0392b" }}
                    >
                      Снять
                    </ConfirmSubmit>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
