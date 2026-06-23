import { prisma } from "@/lib/db";
import { parseList } from "@/lib/json";
import { LeadStatus } from "@/components/admin/LeadStatus";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Заявки</h1>
          <p className="admin__sub">С формы «Бесплатное пробное». Всего: {leads.length}</p>
        </div>
      </div>

      <table className="atable">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Контакт</th>
            <th>Уровень</th>
            <th>Цели / время</th>
            <th>Дата</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && <tr><td colSpan={6} className="muted">Заявок пока нет</td></tr>}
          {leads.map((l) => {
            const goals = parseList(l.goals);
            const days = parseList(l.days);
            return (
              <tr key={l.id}>
                <td><b>{l.name}</b></td>
                <td>{l.contactType}<br /><span className="muted">{l.contactValue}</span></td>
                <td className="muted">{l.level ?? "—"}</td>
                <td className="muted">
                  {goals.join(", ") || "—"}
                  {(days.length > 0 || l.time) && <><br />{days.join(", ")} {l.time ? `· ${l.time}` : ""}</>}
                </td>
                <td className="muted">{new Date(l.createdAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}</td>
                <td><LeadStatus id={l.id} status={l.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
