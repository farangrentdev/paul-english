import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "student" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { lessons: true, payments: true } } },
  });

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Ученики</h1>
          <p className="admin__sub">Всего: {students.length}</p>
        </div>
        <Link className="btn btn--accent" href="/admin/students/new">+ Добавить ученика</Link>
      </div>

      <table className="atable">
        <thead>
          <tr><th>Имя</th><th>Email / телефон</th><th>Пакет</th><th>Занятий</th><th></th></tr>
        </thead>
        <tbody>
          {students.length === 0 && <tr><td colSpan={5} className="muted">Учеников пока нет</td></tr>}
          {students.map((s) => (
            <tr key={s.id}>
              <td><b>{s.name}</b></td>
              <td>{s.email}<br /><span className="muted">{s.phone ?? "—"}</span></td>
              <td className="muted">{s.packageName ?? "—"}</td>
              <td className="muted">{s._count.lessons}</td>
              <td className="actions">
                <Link className="btn btn--ghost btn--sm" href={`/admin/students/${s.id}`}>Открыть</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
