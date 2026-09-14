"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

const OPS: [string, string][] = [
  ["/admin", "Сводка"],
  ["/admin/leads", "Заявки"],
  ["/admin/students", "Ученики"],
  ["/admin/payments", "Платежи"],
  ["/admin/schedule", "Расписание"],
];

const CONTENT: [string, string][] = [
  ["/admin/settings", "Настройки сайта"],
  ["/admin/team", "Педагоги"],
  ["/admin/packages", "Пакеты"],
  ["/admin/promos", "Акции"],
  ["/admin/benefits", "Преимущества"],
  ["/admin/lessons", "Виды занятий"],
  ["/admin/reviews", "Отзывы"],
  ["/admin/faq", "FAQ"],
  ["/admin/materials", "Материалы"],
  ["/admin/legal", "Правовые документы"],
];

const SYSTEM: [string, string][] = [
  ["/admin/payment-settings", "Приём платежей"],
];

export function AdminNav({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isOn = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  const close = () => setOpen(false);

  const currentLabel =
    [...OPS, ...CONTENT, ...SYSTEM].find(([href]) => isOn(href))?.[1] ?? "Меню";

  return (
    <>
      {/* Мобильная шапка: показывает текущий раздел и разворачивает меню */}
      <div className="admin__mobilebar">
        <Link className="admin__brand" href="/admin" onClick={close}>
          <b className="serif">Paul</b>
          <span className="hand" style={{ fontSize: 15, color: "var(--ink-soft)" }}>admin</span>
        </Link>
        <button
          className="btn btn--sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {currentLabel} {open ? "▲" : "▼"}
        </button>
      </div>

      <aside className={"admin__side" + (open ? " open" : "")} onClick={close}>
      <Link className="admin__brand" href="/admin">
        <b className="serif">Paul</b>
        <span className="hand" style={{ fontSize: 16, color: "var(--ink-soft)" }}>admin</span>
      </Link>

      {OPS.map(([href, label]) => (
        <Link key={href} className={"admin__navi" + (isOn(href) ? " on" : "")} href={href}>
          {label}
          {href === "/admin/leads" && newLeads > 0 && <span className="admin__count">{newLeads}</span>}
        </Link>
      ))}

      <div className="admin__navtitle">Контент сайта</div>
      {CONTENT.map(([href, label]) => (
        <Link key={href} className={"admin__navi" + (isOn(href) ? " on" : "")} href={href}>
          {label}
        </Link>
      ))}

      <div className="admin__navtitle">Система</div>
      {SYSTEM.map(([href, label]) => (
        <Link key={href} className={"admin__navi" + (isOn(href) ? " on" : "")} href={href}>
          {label}
        </Link>
      ))}

      <form action={logoutAction} style={{ marginTop: "auto", paddingTop: 14 }}>
        <button className="btn btn--ghost btn--sm" style={{ width: "100%", justifyContent: "center" }}>Выйти</button>
      </form>
      <Link href="/" className="admin__navi" style={{ marginTop: 4 }}>← На сайт</Link>
      </aside>
    </>
  );
}
