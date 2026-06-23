"use client";

import { useState } from "react";
import { useSiteModals } from "./SiteModals";
import { bookSlot } from "@/lib/actions/schedule";

type Day = { weekOrder: number; dayLabel: string; dateLabel: string };
type Slot = { id: string; status: string; mine: boolean };

export function ScheduleGrid({
  days,
  times,
  slots,
  isAuthed,
}: {
  days: Day[];
  times: string[];
  slots: Record<string, Slot>;
  isAuthed: boolean;
}) {
  const { openBook } = useSiteModals();
  const [sel, setSel] = useState<{ day: Day; time: string; id: string } | null>(null);
  const [mine, setMine] = useState<string[]>([]); // локально забронированные ключи
  const [busy, setBusy] = useState(false);

  const key = (wo: number, time: string) => `${wo}-${time}`;

  const stateOf = (wo: number, time: string): string => {
    const k = key(wo, time);
    if (mine.includes(k)) return "mine";
    const s = slots[k];
    if (!s) return "booked";
    if (s.mine) return "mine";
    return s.status === "free" ? "free" : "booked";
  };

  const pick = (day: Day, time: string) => {
    const s = slots[key(day.weekOrder, time)];
    if (!s || stateOf(day.weekOrder, time) !== "free") return;
    setSel({ day, time, id: s.id });
  };

  const confirm = async () => {
    if (!sel) return;
    if (!isAuthed) {
      setSel(null);
      openBook();
      return;
    }
    setBusy(true);
    const res = await bookSlot(sel.id);
    setBusy(false);
    if (res.ok) {
      setMine((m) => [...m, key(sel.day.weekOrder, sel.time)]);
    }
    setSel(null);
  };

  return (
    <>
      <div className="sch">
        <div className="sch__corner muted upper">время</div>
        {days.map((d) => (
          <div className="sch__day" key={d.weekOrder}>
            <b>{d.dayLabel}</b>
            <span className="muted">{d.dateLabel}</span>
          </div>
        ))}

        {times.map((t) => (
          <div key={t} style={{ display: "contents" }}>
            <div className="sch__time mono-num">{t}</div>
            {days.map((d) => {
              const st = stateOf(d.weekOrder, t);
              const isSel = sel && sel.day.weekOrder === d.weekOrder && sel.time === t;
              return (
                <button
                  key={d.weekOrder}
                  className={"sch__slot s-" + st + (isSel ? " sel" : "")}
                  onClick={() => pick(d, t)}
                  disabled={st !== "free"}
                >
                  {st === "free" && (isSel ? "выбрано" : "")}
                  {st === "mine" && "★ ты"}
                  {st === "booked" && "—"}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 18, fontSize: 14 }}>
        Нет удобного времени?{" "}
        <button className="linklike" onClick={openBook}>Оставь заявку</button> — подберём индивидуально.
      </p>

      {sel && (
        <div className="sch__confirm">
          <div className="wrap row between center">
            <div>
              <span className="muted upper">выбран слот</span>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {sel.day.dayLabel}, {sel.day.dateLabel} · {sel.time}
              </div>
            </div>
            <div className="row gap12 center">
              <button className="btn btn--ghost btn--sm" onClick={() => setSel(null)} disabled={busy}>Отмена</button>
              <button className="btn btn--accent" onClick={confirm} disabled={busy}>
                {busy ? "Бронируем…" : "Забронировать →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
