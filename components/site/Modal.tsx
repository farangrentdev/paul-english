"use client";

import type { ReactNode } from "react";

export function Modal({
  children,
  onClose,
  wide,
}: {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="modal" onMouseDown={onClose}>
      <div
        className={"modal__panel" + (wide ? " modal__panel--wide" : "")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modal__x" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
