import Link from "next/link";
import { parsePairs } from "@/lib/json";

type Settings = {
  email: string;
  phone: string;
  telegram: string;
  socials: string;
  footerLegal: string;
};

export function Footer({ settings }: { settings: Settings }) {
  const socials = parsePairs(settings.socials);
  const phoneHref = "tel:" + settings.phone.replace(/[^\d+]/g, "");

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__top">
          <div className="foot__brand">
            <div className="nav__logo" style={{ marginBottom: 14 }}>
              <b>Pavel</b>
              <span className="dot"></span>
              <b className="serif ital" style={{ fontSize: 24 }}>English</b>
            </div>
            <p className="muted" style={{ maxWidth: "24em" }}>
              Частная практика английского языка. Дети и взрослые, онлайн по всему миру и офлайн по договорённости.
            </p>
            <div className="foot__socials">
              {socials.map((s) => (
                <a key={s.label} href={s.url || "#"} className="foot__soc" target="_blank" rel="noreferrer">{s.label}</a>
              ))}
            </div>
          </div>

          <div className="foot__cols">
            <div className="foot__col">
              <h4>Навигация</h4>
              <Link href="/#about">Обо мне</Link>
              <Link href="/#lessons">Занятия</Link>
              <Link href="/#pricing">Цены</Link>
              <Link href="/#teachers">Педагоги</Link>
              <Link href="/#reviews">Отзывы</Link>
            </div>
            <div className="foot__col">
              <h4>Сервисы</h4>
              <Link href="/schedule">Онлайн-запись</Link>
              <Link href="/materials">Материалы</Link>
              <Link href="/cabinet">Личный кабинет</Link>
              <Link href="/#faq">Вопросы</Link>
            </div>
            <div className="foot__col">
              <h4>Контакты</h4>
              <a href={"mailto:" + settings.email}>{settings.email}</a>
              <a href={phoneHref}>{settings.phone}</a>
              <span className="muted" style={{ fontSize: 15 }}>{settings.telegram}</span>
            </div>
          </div>
        </div>

        <div className="foot__legal">
          <span className="muted">{settings.footerLegal}</span>
          <div className="foot__legal-links">
            <Link href="/legal">Политика конфиденциальности</Link>
            <Link href="/legal">Согласие на обработку данных</Link>
            <Link href="/legal">Реквизиты и оферта</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
