"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSiteModals } from "./SiteModals";
import { bookSlot } from "@/lib/actions/schedule";

export type SlotState = "free" | "booked" | "mine" | "past" | "none";

type Day = { key: string; weekday: number; dayLabel: string; dateLabel: string };

export function ScheduleGrid({
  days,
  times,
  states,
  isAuthed,
}: {
  days: Day[];
  times: string[];
  states: Record<string, SlotState>; // "YYYY-MM-DD|HH:MM" → state
  isAuthed: boolean;
}) {
  const router = useRouter();
  const { openBook } = useSiteModals();
  const [sel, setSel] = useState<{ day: Day; time: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justBooked, setJustBooked] = useState<string[]>([]);

  const key = (date: string, time: string) => `${date}|${time}`;
  const stateOf = (date: string, time: string): SlotState =>
    justBooked.includes(key(date, time)) ? "mine" : states[key(date, time)] ?? "none";

  const pick = (day: Day, time: string) => {
    if (stateOf(day.key, time) !== "free") return;
    setError(null);
    setSel({ day, time });
  };

  const confirm = async () => {
    if (!sel) return;
    if (!isAuthed) {
      setSel(null);
      openBook();
      return;
    }
    setBusy(true);
    const res = await bookSlot(sel.day.key, sel.time);
    setBusy(false);
    if (res.ok) {
      setJustBooked((m) => [...m, key(sel.day.key, sel.time)]);
      setSel(null);
      router.refresh();
    } else {
      setError(res.error ?? "Не удалось забронировать");
      setSel(null);
    }
  };

  return (
    <>
      <div className="sch" style={{ gridTemplateColumns: `72px repeat(${days.length}, 1fr)` }}>
        <div className="sch__corner muted upper">время</div>
        {days.map((d) => (
          <div className="sch__day" key={d.key}>
            <b>{d.dayLabel}</b>
            <span className="muted">{d.dateLabel}</span>
          </div>
        ))}

        {times.map((t) => (
          <div key={t} style={{ display: "contents" }}>
            <div className="sch__time mono-num">{t}</div>
            {days.map((d) => {
              const st = stateOf(d.key, t);
              const isSel = sel?.day.key === d.key && sel?.time === t;
              const label =
                st === "free" ? (isSel ? "выбрано" : "") :
                st === "mine" ? "★ ты" :
                st === "booked" ? "—" :
                st === "past" ? "" : "";
              return (
                <button
                  key={d.key}
                  className={"sch__slot s-" + (st === "past" || st === "none" ? "booked" : st) + (isSel ? " sel" : "")}
                  onClick={() => pick(d, t)}
                  disabled={st !== "free"}
                  style={st === "none" ? { opacity: 0.35 } : st === "past" ? { opacity: 0.5 } : undefined}
                  title={st === "past" ? "время прошло" : st === "none" ? "занятий нет" : undefined}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {error && <p className="error-text" style={{ marginTop: 14 }}>{error}</p>}

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
