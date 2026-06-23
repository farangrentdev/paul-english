import Link from "next/link";
import { prisma } from "@/lib/db";
import { createStudent } from "@/lib/admin/ops-actions";

export default async function NewStudentPage() {
  const packages = await prisma.package.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Новый ученик</h1>
          <p className="admin__sub">Создаст учётную запись с ролью «ученик».</p>
        </div>
      </div>

      <form className="aform" action={createStudent}>
        <div className="row2">
          <div className="field">
            <label>Имя</label>
            <input className="input" name="name" placeholder="Анна" />
          </div>
          <div className="field">
            <label>Телефон</label>
            <input className="input" name="phone" placeholder="+7 ..." />
          </div>
        </div>
        <div className="field">
          <label>Email (логин)</label>
          <input className="input" name="email" type="email" placeholder="anna@mail.ru" required />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input className="input" name="password" type="text" placeholder="мин. 6 символов" required />
        </div>
        <div className="field">
          <label>Пакет</label>
          <input className="input" name="packageName" list="pkgs" placeholder="В потоке" />
          <datalist id="pkgs">
            {packages.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
        </div>
        <div className="aform__actions">
          <button className="btn btn--accent">Создать ученика</button>
          <Link className="btn btn--ghost" href="/admin/students">Отмена</Link>
        </div>
      </form>
    </>
  );
}
