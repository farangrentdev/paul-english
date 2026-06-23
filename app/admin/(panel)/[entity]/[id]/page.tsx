import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getEntity } from "@/lib/admin/config";
import { valuesFromRecord } from "@/lib/admin/display";
import { EntityForm } from "@/components/admin/EntityForm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function delegate(model: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[model];
}

export default async function EditEntityPage({
  params,
}: {
  params: Promise<{ entity: string; id: string }>;
}) {
  const { entity: key, id } = await params;
  const entity = getEntity(key);
  if (!entity) notFound();

  const where = { id: isNaN(Number(id)) ? id : Number(id) };
  const rec = await delegate(entity.model).findUnique({ where });
  if (!rec) notFound();

  const values = valuesFromRecord(entity.fields, rec);

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Изменить: {entity.title.toLowerCase()}</h1>
        </div>
      </div>
      <EntityForm entityKey={key} fields={entity.fields} values={values} id={id} backHref={`/admin/${key}`} />
    </>
  );
}
