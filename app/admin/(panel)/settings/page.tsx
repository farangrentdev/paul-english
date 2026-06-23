import { getSettings } from "@/lib/content";
import { SETTINGS_FIELDS } from "@/lib/admin/config";
import { valuesFromRecord } from "@/lib/admin/display";
import { updateSettings } from "@/lib/admin/actions";
import { EntityForm } from "@/components/admin/EntityForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const values = valuesFromRecord(SETTINGS_FIELDS, settings as unknown as Record<string, unknown>);

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Настройки сайта</h1>
          <p className="admin__sub">Hero, блок «Обо мне», контакты и подвал.</p>
        </div>
      </div>
      <EntityForm fields={SETTINGS_FIELDS} values={values} backHref="/admin" action={updateSettings} />
    </>
  );
}
