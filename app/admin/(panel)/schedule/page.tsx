import { prisma } from "@/lib/db";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import {
  toggleWorkingSlot,
  addWorkingTime,
  removeWorkingTime,
  cancelBooking,
} from "@/lib/admin/ops-actions";
import { WEEKDAY_LABELS, todayKey, weekdayOf } from "@/lib/week";

export default async function AdminSchedulePage() {
  const [template, bookings] = await Promise.all([
    prisma.workingSlot.findMany({ orderBy: [{ time: "asc" }, { weekday: "asc" }] }),
    prisma.scheduleSlot.findMany({
      where: { date: { gte: todayKey() } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      include: { bookedBy: true },
      take: 100,
    }),
  ]);

  const times = [...new Set(template.map((t) => t.time))].sort();
  const enabled = new Map(template.map((t) => [`${t.weekday}|${t.time}`, t.enabled]));

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Расписание</h1>
          <p className="admin__sub">
            Шаблон рабочей недели — какие окошки открыты для записи. Даты на сайте
            подставляются автоматически, ничего обновлять вручную не нужно.
          </p>
        </div>
      </div>

      <h2 className="serif" style={{ fontSize: 24, marginBottom: 12 }}>Рабочие часы</h2>
      <p className="muted" style={{ marginTop: -6, marginBottom: 14, fontSize: 14 }}>
        Клик по ячейке включает или выключает окошко в этот день недели.
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
          {times.length === 0 && (
            <tr><td colSpan={9} className="muted">Рабочих часов пока нет — добавьте время ниже</td></tr>
          )}
          {times.map((t) => (
            <tr key={t}>
              <td className="mono-num"><b>{t}</b></td>
              {WEEKDAY_LABELS.map((_, i) => {
                const weekday = i + 1;
                const on = enabled.get(`${weekday}|${t}`) ?? false;
                return (
                  <td key={weekday} style={{ textAlign: "center" }}>
                    <form action={toggleWorkingSlot.bind(null, weekday, t)}>
                      <button
                        className={"btn btn--sm " + (on ? "btn--accent" : "btn--ghost")}
                        style={{ width: "100%", justifyContent: "center", minWidth: 54 }}
                        title={on ? "открыто для записи" : "выходной"}
                      >
                        {on ? "✓" : "—"}
                      </button>
                    </form>
                  </td>
                );
              })}
              <td className="actions">
                <ConfirmSubmit
                  action={removeWorkingTime.bind(null, t)}
                  confirmText={`Убрать время ${t} из расписания?`}
                  style={{ color: "#c0392b" }}
                >
                  Убрать
                </ConfirmSubmit>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form action={addWorkingTime} className="row gap12 center" style={{ marginBottom: 34, flexWrap: "wrap" }}>
        <div className="field" style={{ maxWidth: 160 }}>
          <label>Новое время</label>
          <input className="input mono-num" name="time" placeholder="19:00" pattern="[0-9]{2}:[0-9]{2}" required />
        </div>
        <button className="btn btn--ink btn--sm" style={{ marginTop: 22 }}>+ Добавить в будни</button>
        <span className="muted" style={{ fontSize: 13, marginTop: 22 }}>
          добавится в Пн–Пт, потом можно включить нужные дни в таблице
        </span>
      </form>

      <h2 className="serif" style={{ fontSize: 24, marginBottom: 12 }}>Предстоящие записи</h2>
      <table className="atable">
        <thead>
          <tr><th>Дата</th><th>День</th><th>Время</th><th>Ученик</th><th></th></tr>
        </thead>
        <tbody>
          {bookings.length === 0 && (
            <tr><td colSpan={5} className="muted">Записей пока нет</td></tr>
          )}
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="mono-num">{b.date}</td>
              <td className="muted">{WEEKDAY_LABELS[weekdayOf(b.date) - 1]}</td>
              <td className="mono-num"><b>{b.time}</b></td>
              <td>
                {b.bookedBy ? (
                  <><b>{b.bookedBy.name}</b><br /><span className="muted">{b.bookedBy.email}</span></>
                ) : (
                  <span className="muted">— (блокировка)</span>
                )}
              </td>
              <td className="actions">
                <ConfirmSubmit
                  action={cancelBooking.bind(null, b.id)}
                  confirmText="Снять эту запись? Слот снова станет свободным."
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
  );
}
