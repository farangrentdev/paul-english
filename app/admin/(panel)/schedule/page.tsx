import { prisma } from "@/lib/db";
import { toggleSlot } from "@/lib/admin/ops-actions";

export default async function AdminSchedulePage() {
  const rows = await prisma.scheduleSlot.findMany({
    orderBy: [{ weekOrder: "asc" }, { time: "asc" }],
    include: { bookedBy: true },
  });

  const days = [...new Map(rows.map((s) => [s.weekOrder, { weekOrder: s.weekOrder, dayLabel: s.dayLabel, dateLabel: s.dateLabel }])).values()].sort((a, b) => a.weekOrder - b.weekOrder);
  const times = [...new Set(rows.map((s) => s.time))].sort();
  const byKey = new Map(rows.map((s) => [`${s.weekOrder}-${s.time}`, s]));

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Расписание</h1>
          <p className="admin__sub">Клик по слоту переключает «свободно ↔ занято».</p>
        </div>
      </div>

      <table className="atable">
        <thead>
          <tr>
            <th>Время</th>
            {days.map((d) => (
              <th key={d.weekOrder}>{d.dayLabel} {d.dateLabel}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((t) => (
            <tr key={t}>
              <td className="mono-num"><b>{t}</b></td>
              {days.map((d) => {
                const slot = byKey.get(`${d.weekOrder}-${t}`);
                if (!slot) return <td key={d.weekOrder} className="muted">—</td>;
                const free = slot.status === "free";
                return (
                  <td key={d.weekOrder}>
                    <form action={toggleSlot.bind(null, slot.id)}>
                      <button
                        className={"btn btn--sm " + (free ? "btn--accent" : "btn--ink")}
                        style={{ width: "100%", justifyContent: "center" }}
                        title={slot.bookedBy ? `Занял: ${slot.bookedBy.name}` : ""}
                      >
                        {free ? "свободно" : slot.bookedBy ? `★ ${slot.bookedBy.name}` : "занято"}
                      </button>
                    </form>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
