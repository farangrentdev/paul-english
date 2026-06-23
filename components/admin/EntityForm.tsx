"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { Field } from "@/lib/admin/config";
import { createEntity, updateEntity } from "@/lib/admin/actions";

type Values = Record<string, string | boolean>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--accent" disabled={pending}>
      {pending ? "Сохраняем…" : "Сохранить"}
    </button>
  );
}

export function EntityForm({
  entityKey,
  fields,
  values,
  id,
  backHref,
  action: customAction,
}: {
  entityKey?: string;
  fields: Field[];
  values: Values;
  id?: string;
  backHref: string;
  action?: (formData: FormData) => void | Promise<void>;
}) {
  const action =
    customAction ??
    (id
      ? updateEntity.bind(null, entityKey!, id)
      : createEntity.bind(null, entityKey!));

  return (
    <form className="aform" action={action}>
      {fields.map((f) => {
        const val = values[f.name];
        if (f.type === "checkbox") {
          return (
            <label key={f.name} className="aform__check">
              <input type="checkbox" name={f.name} defaultChecked={!!val} />
              {f.label}
            </label>
          );
        }
        if (f.type === "textarea" || f.type === "list" || f.type === "pairs") {
          return (
            <div className="field" key={f.name}>
              <label>{f.label}</label>
              <textarea className="input" name={f.name} rows={f.type === "textarea" ? 4 : 5} defaultValue={String(val ?? "")} placeholder={f.placeholder} />
              {f.help && <span className="muted" style={{ fontSize: 12 }}>{f.help}</span>}
            </div>
          );
        }
        if (f.type === "image") {
          const url = String(val ?? "");
          return (
            <div className="field" key={f.name}>
              <label>{f.label}</label>
              {url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" style={{ width: 120, height: 120, objectFit: "cover", border: "1.5px solid var(--ink)", borderRadius: 4, marginBottom: 8 }} />
              )}
              <input type="hidden" name={`__current_${f.name}`} value={url} />
              <input className="input" type="file" name={f.name} accept="image/*" />
              <span className="muted" style={{ fontSize: 12 }}>Оставьте пустым, чтобы не менять</span>
            </div>
          );
        }
        return (
          <div className="field" key={f.name}>
            <label>{f.label}</label>
            <input
              className="input"
              type={f.type === "number" ? "number" : "text"}
              name={f.name}
              defaultValue={String(val ?? "")}
              placeholder={f.placeholder}
            />
            {f.help && <span className="muted" style={{ fontSize: 12 }}>{f.help}</span>}
          </div>
        );
      })}

      <div className="aform__actions">
        <SubmitButton />
        <Link className="btn btn--ghost" href={backHref}>Отмена</Link>
      </div>
    </form>
  );
}
