"use client";

import { deleteEntity } from "@/lib/admin/actions";

export function DeleteButton({ entityKey, id }: { entityKey: string; id: string }) {
  const action = deleteEntity.bind(null, entityKey, id);
  return (
    <form
      action={action}
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm("Удалить запись? Действие необратимо.")) e.preventDefault();
      }}
    >
      <button className="btn btn--ghost btn--sm" style={{ color: "#c0392b" }}>Удалить</button>
    </form>
  );
}
