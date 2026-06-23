"use client";

import { useState } from "react";
import { useSiteModals } from "./SiteModals";
import type { PayTarget } from "./Payment";
import { logoutAction } from "@/lib/actions/auth";

type Lesson = { id: string; time: string; dateLabel: string; topic: string; status: string };
type Journal = { id: string; mark: string; topic: string; date: string; note: string };
type Mat = { id: string; tag: string; title: string; size: string; fileUrl: string | null };
type Pay = { id: string; period: string; amount: number; status: string; packageName: string };

const TABS = [
  { id: "home", t: "Обзор" },
  { id: "sched", t: "Расписание" },
  { id: "journal", t: "Журнал" },
  { id: "mats", t: "Материалы" },
  { id: "pay", t: "Оплата" },
];

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export function CabinetDashboard({
  name,
  packageName,
  lessons,
  journal,
  materials,
  payments,
  payTarget,
  stats,
  paidBanner,
}: {
  name: string;
  packageName: string | null;
  lessons: Lesson[];
  journal: Journal[];
  materials: Mat[];
  payments: Pay[];
  payTarget: PayTarget | null;
  stats: { journal: number; upcoming: number; lastMark: string; paid: number };
  paidBanner: boolean;
}) {
  const [tab, setTab] = useState("home");
  const { openPay } = useSiteModals();
  const next = lessons.find((l) => l.status === "soon") ?? lessons[0];

  return (
    <div className="page cab">
      <div className="wrap cab__grid">
        <aside className="cab__side">
          <div className="cab__user">
            <span className="ravatar" style={{ width: 48, height: 48, fontSize: 20 }}>{name[0]}</span>
            <div>
              <b>{name}</b><br />
              <span className="muted" style={{ fontSize: 13 }}>{packageName ? `пакет «${packageName}»` : "без пакета"}</span>
            </div>
          </div>
          <nav className="cab__nav">
            {TABS.map((x) => (
              <button key={x.id} className={"cab__navi" + (tab === x.id ? " on" : "")} onClick={() => setTab(x.id)}>
                {x.t}
                {x.id === "pay" && payTarget && <span className="cab__alert">!</span>}
              </button>
            ))}
          </nav>
          <form action={logoutAction}>
            <button className="btn btn--ghost btn--sm" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>Выйти</button>
          </form>
        </aside>

        <div className="cab__main">
          {paidBanner && <div className="flash">✓ Оплата прошла! Пакет активен — чек и расписание уже здесь.</div>}

          {tab === "home" && (
            <>
              <h2 className="display" style={{ fontSize: 40 }}>Привет, {name}!</h2>
              <div className="cab__cards">
                <div className="cab__big card card--shadow">
                  <span className="tag tag--accent">Ближайшее занятие</span>
                  {next ? (
                    <>
                      <div className="cab__next">
                        <div className="display" style={{ fontSize: 56, lineHeight: 0.9 }}>{next.time}</div>
                        <div>
                          <b>{next.dateLabel}</b><br />
                          <span className="muted">{next.topic}</span>
                        </div>
                      </div>
                      <div className="row gap12">
                        <button className="btn btn--accent">Подключиться к уроку</button>
                        <button className="btn btn--ghost btn--sm">Перенести</button>
                      </div>
                    </>
                  ) : (
                    <p className="muted" style={{ margin: "12px 0 0" }}>Занятий пока не запланировано.</p>
                  )}
                </div>

                {payTarget && (
                  <div className="cab__remind card">
                    <span className="tag tag--ink">Напоминание</span>
                    <p style={{ fontSize: 17, margin: "12px 0" }}>
                      Оплата пакета «{payTarget.packageName}» — {payTarget.period}.
                    </p>
                    <button className="btn btn--accent" onClick={() => openPay(payTarget)}>Оплатить {fmt(payTarget.amount)}</button>
                  </div>
                )}
              </div>

              <div className="cab__streak card">
                <div><div className="display" style={{ fontSize: 40 }}>{stats.journal}</div><span className="muted">занятий в журнале</span></div>
                <div><div className="display" style={{ fontSize: 40 }}>{stats.upcoming}</div><span className="muted">занятий впереди</span></div>
                <div><div className="display" style={{ fontSize: 40 }}>{stats.lastMark}</div><span className="muted">последняя оценка</span></div>
                <div><div className="display" style={{ fontSize: 40 }}>{stats.paid}</div><span className="muted">оплат прошло</span></div>
              </div>
            </>
          )}

          {tab === "sched" && (
            <>
              <h2 className="display" style={{ fontSize: 40 }}>Расписание</h2>
              <div className="cab__list">
                {lessons.length === 0 && <p className="muted">Занятий пока нет.</p>}
                {lessons.map((l) => (
                  <div className={"cab__row card" + (l.status === "soon" ? " hot" : "")} key={l.id}>
                    <div className="cab__rowtime"><b>{l.time}</b><span className="muted">{l.dateLabel}</span></div>
                    <div className="grow"><b>{l.topic}</b></div>
                    {l.status === "soon" ? (
                      <button className="btn btn--accent btn--sm">Подключиться</button>
                    ) : (
                      <button className="btn btn--ghost btn--sm">Перенести</button>
                    )}
                  </div>
                ))}
              </div>
              <p className="hand" style={{ fontSize: 22, marginTop: 18, color: "var(--ink-soft)" }}>напомню в Telegram за час до каждого занятия 🔔</p>
            </>
          )}

          {tab === "journal" && (
            <>
              <h2 className="display" style={{ fontSize: 40 }}>Журнал</h2>
              <p className="muted" style={{ marginTop: -6 }}>Что прошли, как идёт и над чем работаем.</p>
              <div className="cab__list">
                {journal.length === 0 && <p className="muted">Записей пока нет.</p>}
                {journal.map((j) => (
                  <div className="cab__jrow card" key={j.id}>
                    <div className="cab__mark">{j.mark}</div>
                    <div className="grow">
                      <div className="row between center"><b>{j.topic}</b><span className="muted" style={{ fontSize: 13 }}>{j.date}</span></div>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: 15 }}>{j.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "mats" && (
            <>
              <h2 className="display" style={{ fontSize: 40 }}>Мои материалы</h2>
              <div className="cab__list">
                {materials.length === 0 && <p className="muted">Материалов пока нет.</p>}
                {materials.map((m) => (
                  <div className="cab__row card" key={m.id}>
                    <span className="tag tag--ink">{m.tag}</span>
                    <div className="grow"><b>{m.title}</b></div>
                    <span className="muted" style={{ fontSize: 13 }}>{m.size}</span>
                    {m.fileUrl ? (
                      <a className="btn btn--sm" href={m.fileUrl} target="_blank" rel="noreferrer" download>Скачать ↓</a>
                    ) : (
                      <button className="btn btn--sm" disabled>Скоро ↓</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "pay" && (
            <>
              <h2 className="display" style={{ fontSize: 40 }}>Оплата</h2>
              {payTarget && (
                <div className="cab__remind card card--shadow" style={{ borderColor: "var(--ink)" }}>
                  <div className="row between center" style={{ flexWrap: "wrap", gap: 14 }}>
                    <div>
                      <span className="tag tag--accent">Нужно оплатить</span>
                      <p style={{ fontSize: 18, margin: "12px 0 4px" }}><b>Пакет «{payTarget.packageName}» · {payTarget.period}</b></p>
                      <span className="muted">оплата картой онлайн</span>
                    </div>
                    <div className="col" style={{ alignItems: "flex-end", gap: 8 }}>
                      <div className="display" style={{ fontSize: 46, lineHeight: 1 }}>{fmt(payTarget.amount)}</div>
                      <button className="btn btn--accent btn--lg" onClick={() => openPay(payTarget)}>Оплатить картой</button>
                    </div>
                  </div>
                </div>
              )}
              <h3 style={{ marginTop: 28, marginBottom: 10 }}>История платежей</h3>
              <div className="cab__list">
                {payments.length === 0 && <p className="muted">Платежей пока нет.</p>}
                {payments.map((p) => (
                  <div className="cab__row card" key={p.id}>
                    <div className="grow"><b>Пакет «{p.packageName}» · {p.period}</b></div>
                    <span className="mono-num">{fmt(p.amount)}</span>
                    <span className="tag" style={{ background: p.status === "paid" ? "var(--paper-2)" : undefined }}>
                      {p.status === "paid" ? "✓ оплачено" : p.status === "pending" ? "ожидает" : "ошибка"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
