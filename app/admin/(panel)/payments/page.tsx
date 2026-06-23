import { prisma } from "@/lib/db";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const STATUS: Record<string, string> = {
  paid: "оплачено",
  pending: "ожидает",
  failed: "ошибка",
  canceled: "отменён",
};

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Платежи</h1>
          <p className="admin__sub">История оплат через ЮKassa. Всего: {payments.length}</p>
        </div>
      </div>

      <table className="atable">
        <thead>
          <tr><th>Ученик</th><th>Пакет</th><th>Сумма</th><th>Статус</th><th>Создан</th><th>Оплачен</th></tr>
        </thead>
        <tbody>
          {payments.length === 0 && <tr><td colSpan={6} className="muted">Платежей пока нет</td></tr>}
          {payments.map((p) => (
            <tr key={p.id}>
              <td><b>{p.user.name}</b><br /><span className="muted">{p.user.email}</span></td>
              <td>{p.packageName} · {p.period}</td>
              <td className="mono-num">{fmt(p.amount)}</td>
              <td><span className={"badge" + (p.status === "paid" ? " badge--ok" : "")}>{STATUS[p.status] ?? p.status}</span></td>
              <td className="muted">{new Date(p.createdAt).toLocaleDateString("ru-RU")}</td>
              <td className="muted">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("ru-RU") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
