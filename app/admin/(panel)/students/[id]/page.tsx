import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import {
  updateStudent,
  deleteStudent,
  addLesson,
  deleteLesson,
  addJournal,
  deleteJournal,
  addMaterial,
  deleteStudentMaterial,
} from "@/lib/admin/ops-actions";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, packages] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: "asc" } },
        journal: { orderBy: { order: "asc" } },
        materials: { orderBy: { order: "asc" } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.package.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!student || student.role !== "student") notFound();

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>{student.name}</h1>
          <p className="admin__sub">{student.email}</p>
        </div>
        <Link className="btn btn--ghost btn--sm" href="/admin/students">← К списку</Link>
      </div>

      {/* профиль */}
      <h2 className="serif" style={{ fontSize: 24, marginBottom: 12 }}>Профиль</h2>
      <form className="aform" action={updateStudent.bind(null, id)} style={{ marginBottom: 16 }}>
        <div className="row2">
          <div className="field"><label>Имя</label><input className="input" name="name" defaultValue={student.name} /></div>
          <div className="field"><label>Телефон</label><input className="input" name="phone" defaultValue={student.phone ?? ""} /></div>
        </div>
        <div className="row2">
          <div className="field">
            <label>Пакет</label>
            <input className="input" name="packageName" list="pkgs" defaultValue={student.packageName ?? ""} />
            <datalist id="pkgs">{packages.map((p) => <option key={p.id} value={p.name} />)}</datalist>
          </div>
          <div className="field"><label>Новый пароль</label><input className="input" name="password" placeholder="оставьте пустым" /></div>
        </div>
        <div className="aform__actions">
          <button className="btn btn--accent">Сохранить профиль</button>
          <ConfirmSubmit action={deleteStudent.bind(null, id)} confirmText="Удалить ученика и все его данные?" className="btn btn--ghost" style={{ color: "#c0392b" }}>
            Удалить ученика
          </ConfirmSubmit>
        </div>
      </form>

      {/* расписание */}
      <h2 className="serif" style={{ fontSize: 24, margin: "26px 0 12px" }}>Расписание</h2>
      <table className="atable" style={{ marginBottom: 12 }}>
        <thead><tr><th>Дата</th><th>Время</th><th>Тема</th><th>Статус</th><th></th></tr></thead>
        <tbody>
          {student.lessons.length === 0 && <tr><td colSpan={5} className="muted">Нет занятий</td></tr>}
          {student.lessons.map((l) => (
            <tr key={l.id}>
              <td>{l.dateLabel}</td><td className="mono-num">{l.time}</td><td>{l.topic}</td><td className="muted">{l.status}</td>
              <td className="actions"><ConfirmSubmit action={deleteLesson.bind(null, id, l.id)} style={{ color: "#c0392b" }}>×</ConfirmSubmit></td>
            </tr>
          ))}
        </tbody>
      </table>
      <form action={addLesson.bind(null, id)} className="aform" style={{ maxWidth: "none" }}>
        <div className="row2">
          <div className="field"><label>Дата (текст)</label><input className="input" name="dateLabel" placeholder="Чт, 5 июня" /></div>
          <div className="field"><label>Время</label><input className="input" name="time" placeholder="19:00" /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Тема</label><input className="input" name="topic" placeholder="Past Simple" /></div>
          <div className="field">
            <label>Статус</label>
            <select className="input" name="status" defaultValue="plan">
              <option value="soon">ближайшее</option>
              <option value="plan">запланировано</option>
              <option value="done">проведено</option>
            </select>
          </div>
        </div>
        <div className="aform__actions"><button className="btn btn--ink btn--sm">+ Добавить занятие</button></div>
      </form>

      {/* журнал */}
      <h2 className="serif" style={{ fontSize: 24, margin: "26px 0 12px" }}>Журнал</h2>
      <table className="atable" style={{ marginBottom: 12 }}>
        <thead><tr><th>Дата</th><th>Оценка</th><th>Тема</th><th>Комментарий</th><th></th></tr></thead>
        <tbody>
          {student.journal.length === 0 && <tr><td colSpan={5} className="muted">Нет записей</td></tr>}
          {student.journal.map((j) => (
            <tr key={j.id}>
              <td>{j.date}</td><td><b>{j.mark}</b></td><td>{j.topic}</td><td className="muted">{j.note}</td>
              <td className="actions"><ConfirmSubmit action={deleteJournal.bind(null, id, j.id)} style={{ color: "#c0392b" }}>×</ConfirmSubmit></td>
            </tr>
          ))}
        </tbody>
      </table>
      <form action={addJournal.bind(null, id)} className="aform" style={{ maxWidth: "none" }}>
        <div className="row2">
          <div className="field"><label>Дата</label><input className="input" name="date" placeholder="30 мая" /></div>
          <div className="field"><label>Оценка</label><input className="input" name="mark" placeholder="A−" /></div>
        </div>
        <div className="field"><label>Тема</label><input className="input" name="topic" placeholder="Conditionals" /></div>
        <div className="field"><label>Комментарий</label><textarea className="input" name="note" rows={2} /></div>
        <div className="aform__actions"><button className="btn btn--ink btn--sm">+ Добавить запись</button></div>
      </form>

      {/* материалы */}
      <h2 className="serif" style={{ fontSize: 24, margin: "26px 0 12px" }}>Материалы ученика</h2>
      <table className="atable" style={{ marginBottom: 12 }}>
        <thead><tr><th>Тип</th><th>Название</th><th>Размер</th><th>Файл</th><th></th></tr></thead>
        <tbody>
          {student.materials.length === 0 && <tr><td colSpan={5} className="muted">Нет материалов</td></tr>}
          {student.materials.map((m) => (
            <tr key={m.id}>
              <td>{m.tag}</td><td>{m.title}</td><td className="muted">{m.size}</td>
              <td className="muted">{m.fileUrl ? <a href={m.fileUrl} target="_blank" rel="noreferrer">ссылка</a> : "—"}</td>
              <td className="actions"><ConfirmSubmit action={deleteStudentMaterial.bind(null, id, m.id)} style={{ color: "#c0392b" }}>×</ConfirmSubmit></td>
            </tr>
          ))}
        </tbody>
      </table>
      <form action={addMaterial.bind(null, id)} className="aform" style={{ maxWidth: "none" }}>
        <div className="row2">
          <div className="field"><label>Тип</label><input className="input" name="tag" placeholder="PDF" /></div>
          <div className="field"><label>Размер</label><input className="input" name="size" placeholder="6 стр." /></div>
        </div>
        <div className="field"><label>Название</label><input className="input" name="title" placeholder="Слова недели" /></div>
        <div className="field"><label>Ссылка на файл</label><input className="input" name="fileUrl" placeholder="/uploads/..." /></div>
        <div className="aform__actions"><button className="btn btn--ink btn--sm">+ Добавить материал</button></div>
      </form>

      {/* платежи */}
      <h2 className="serif" style={{ fontSize: 24, margin: "26px 0 12px" }}>Платежи</h2>
      <table className="atable">
        <thead><tr><th>Пакет</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead>
        <tbody>
          {student.payments.length === 0 && <tr><td colSpan={4} className="muted">Платежей нет</td></tr>}
          {student.payments.map((p) => (
            <tr key={p.id}>
              <td>{p.packageName} · {p.period}</td>
              <td className="mono-num">{fmt(p.amount)}</td>
              <td><span className="badge">{p.status}</span></td>
              <td className="muted">{(p.paidAt ?? p.createdAt) ? new Date(p.paidAt ?? p.createdAt).toLocaleDateString("ru-RU") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
