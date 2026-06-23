import { notFound } from "next/navigation";
import { getEntity } from "@/lib/admin/config";
import { EntityForm } from "@/components/admin/EntityForm";

export default async function NewEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity: key } = await params;
  const entity = getEntity(key);
  if (!entity) notFound();

  const values: Record<string, string | boolean> = {};
  for (const f of entity.fields) {
    values[f.name] = f.type === "checkbox" ? false : f.name === "order" ? "0" : "";
  }

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Новый: {entity.title.toLowerCase()}</h1>
        </div>
      </div>
      <EntityForm entityKey={key} fields={entity.fields} values={values} backHref={`/admin/${key}`} />
    </>
  );
}
