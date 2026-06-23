import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getEntity } from "@/lib/admin/config";
import { cellValue } from "@/lib/admin/display";
import { DeleteButton } from "@/components/admin/DeleteButton";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function delegate(model: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[model];
}

export default async function EntityListPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity: key } = await params;
  const entity = getEntity(key);
  if (!entity) notFound();

  const rows: Record<string, unknown>[] = await delegate(entity.model).findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>{entity.title}</h1>
          <p className="admin__sub">Всего записей: {rows.length}</p>
        </div>
        <Link className="btn btn--accent" href={`/admin/${key}/new`}>+ Добавить {entity.singular}</Link>
      </div>

      <table className="atable">
        <thead>
          <tr>
            {entity.listColumns.map((c) => (
              <th key={c.name}>{c.label}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={entity.listColumns.length + 1} className="muted">Пока пусто</td></tr>
          )}
          {rows.map((r) => {
            const id = String(r.id);
            return (
              <tr key={id}>
                {entity.listColumns.map((c) => (
                  <td key={c.name}>{cellValue(entity, r, c.name)}</td>
                ))}
                <td className="actions">
                  <Link className="btn btn--ghost btn--sm" href={`/admin/${key}/${id}`}>Изменить</Link>{" "}
                  <DeleteButton entityKey={key} id={id} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
