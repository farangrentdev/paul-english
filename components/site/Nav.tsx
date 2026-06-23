"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteModals } from "./SiteModals";

const LINKS: [string, string][] = [
  ["about", "Обо мне"],
  ["lessons", "Занятия"],
  ["pricing", "Цены"],
  ["teachers", "Педагоги"],
  ["reviews", "Отзывы"],
  ["faq", "Q&A"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { openBook } = useSiteModals();
  const onHome = pathname === "/";
  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <nav className="nav">
      <div className="wrap nav__bar">
        <Link className="nav__logo" href="/">
          <b>Pavel</b>
          <span className="dot"></span>
          <b className="serif ital" style={{ fontSize: 26 }}>English</b>
        </Link>

        <div className="nav__links">
          {LINKS.map(([id, t]) => (
            <a key={id} href={href(id)} onClick={() => setOpen(false)}>{t}</a>
          ))}
          <Link className={pathname === "/schedule" ? "active" : ""} href="/schedule">Запись</Link>
          <Link className={pathname === "/materials" ? "active" : ""} href="/materials">Материалы</Link>
        </div>

        <div className="nav__right">
          <Link className="btn btn--ghost btn--sm" style={{ textDecoration: "none" }} href="/cabinet">Войти</Link>
          <button className="btn btn--accent btn--sm" onClick={openBook}>Пробное бесплатно</button>
          <button className="nav__burger" onClick={() => setOpen((o) => !o)} aria-label="Меню"><span></span></button>
        </div>
      </div>

      <div className={"wrap nav__mobile" + (open ? " open" : "")}>
        {LINKS.map(([id, t]) => (
          <a key={id} href={href(id)} onClick={() => setOpen(false)}>{t}</a>
        ))}
        <Link href="/schedule" onClick={() => setOpen(false)}>Онлайн-запись</Link>
        <Link href="/materials" onClick={() => setOpen(false)}>Материалы</Link>
        <Link href="/cabinet" onClick={() => setOpen(false)}>Личный кабинет</Link>
        <Link href="/legal" onClick={() => setOpen(false)}>Юр. информация</Link>
      </div>
    </nav>
  );
}

export function Marquee() {
  const items = [
    "говори с первого занятия",
    "без скучных учебников",
    "программа под твою цель",
    "пробное — бесплатно",
    "online по всему миру",
  ];
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row.map((t, i) => (
          <span key={i}>{t} <b>✦</b></span>
        ))}
      </div>
    </div>
  );
}
