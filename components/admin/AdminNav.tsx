"use client";

import Link from "next/link";
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

export function AdminNav({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();
  const isOn = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="admin__side">
      <Link className="admin__brand" href="/admin">
        <b className="serif">Pavel</b>
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

      <form action={logoutAction} style={{ marginTop: "auto", paddingTop: 14 }}>
        <button className="btn btn--ghost btn--sm" style={{ width: "100%", justifyContent: "center" }}>Выйти</button>
      </form>
      <Link href="/" className="admin__navi" style={{ marginTop: 4 }}>← На сайт</Link>
    </aside>
  );
}
