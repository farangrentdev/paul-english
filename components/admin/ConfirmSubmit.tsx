"use client";

import type { ReactNode } from "react";

export function ConfirmSubmit({
  action,
  children,
  className = "btn btn--ghost btn--sm",
  confirmText = "Удалить?",
  style,
}: {
  action: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
  confirmText?: string;
  style?: React.CSSProperties;
}) {
  return (
    <form
      action={action}
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button className={className} style={style}>{children}</button>
    </form>
  );
}
