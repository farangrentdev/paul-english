import Link from "next/link";
import { prisma } from "@/lib/db";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export default async function AdminDashboard() {
  const [newLeads, totalLeads, students, paidAgg, recentLeads, recentPayments] = await Promise.all([
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count(),
    prisma.user.count({ where: { role: "student" } }),
    prisma.payment.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.payment.findMany({ where: { status: "paid" }, orderBy: { paidAt: "desc" }, take: 5, include: { user: true } }),
  ]);

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Сводка</h1>
          <p className="admin__sub">Главное за сегодня — заявки, ученики и оплаты.</p>
        </div>
      </div>

      <div className="adash">
        <Link href="/admin/leads" className="card adash__card" style={{ textDecoration: "none" }}>
          <div className="adash__num">{newLeads}</div>
          <span className="muted">новых заявок</span>
        </Link>
        <div className="card adash__card">
          <div className="adash__num">{totalLeads}</div>
          <span className="muted">заявок всего</span>
        </div>
        <Link href="/admin/students" className="card adash__card" style={{ textDecoration: "none" }}>
          <div className="adash__num">{students}</div>
          <span className="muted">учеников</span>
        </Link>
        <div className="card adash__card">
          <div className="adash__num" style={{ fontSize: 34 }}>{fmt(paidAgg._sum.amount ?? 0)}</div>
          <span className="muted">оплачено всего</span>
        </div>
      </div>

      <h2 className="serif" style={{ fontSize: 26, margin: "10px 0 12px" }}>Последние заявки</h2>
      <table className="atable" style={{ marginBottom: 30 }}>
        <thead>
          <tr><th>Имя</th><th>Контакт</th><th>Цель</th><th>Статус</th></tr>
        </thead>
        <tbody>
          {recentLeads.length === 0 && <tr><td colSpan={4} className="muted">Пока нет заявок</td></tr>}
          {recentLeads.map((l) => (
            <tr key={l.id}>
              <td><b>{l.name}</b></td>
              <td>{l.contactType}: {l.contactValue}</td>
              <td className="muted">{l.level ?? "—"}</td>
              <td><span className={"badge" + (l.status === "new" ? " badge--new" : "")}>{l.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="serif" style={{ fontSize: 26, margin: "10px 0 12px" }}>Последние платежи</h2>
      <table className="atable">
        <thead>
          <tr><th>Ученик</th><th>Пакет</th><th>Сумма</th><th>Когда</th></tr>
        </thead>
        <tbody>
          {recentPayments.length === 0 && <tr><td colSpan={4} className="muted">Пока нет платежей</td></tr>}
          {recentPayments.map((p) => (
            <tr key={p.id}>
              <td><b>{p.user.name}</b></td>
              <td>{p.packageName} · {p.period}</td>
              <td className="mono-num">{fmt(p.amount)}</td>
              <td className="muted">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("ru-RU") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
