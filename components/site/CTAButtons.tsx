"use client";

import type { ReactNode } from "react";
import { useSiteModals } from "./SiteModals";
import type { PayTarget } from "./Payment";

export function BookButton({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const { openBook } = useSiteModals();
  return (
    <button className={className} style={style} onClick={openBook}>
      {children}
    </button>
  );
}

export function PayButton({
  target,
  className,
  style,
  children,
}: {
  target: PayTarget;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const { openPay } = useSiteModals();
  return (
    <button className={className} style={style} onClick={() => openPay(target)}>
      {children}
    </button>
  );
}
