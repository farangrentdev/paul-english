"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSiteModals } from "./SiteModals";
import { bookSlot } from "@/lib/actions/schedule";

export type CellState = "free" | "booked" | "mine" | "closed" | "past" | "none";

export type Cell = { id?: string; state: CellState };

type Day = { key: string; weekday: number; dayLabel: string; dateLabel: string };
export type Member = { id: string; name: string; relation: string; isSelf: boolean };

export function ScheduleGrid({
  days,
  times,
  cells,
  members,
  isAuthed,
}: {
  days: Day[];
  times: string[];
  cells: Record<string, Cell>; // "YYYY-MM-DD|HH:MM"
  members: Member[];
  isAuthed: boolean;
}) {
  const router = useRouter();
  const { openBook } = useSiteModals();
  const [sel, setSel] = useState<{ day: Day; time: string; id: string } | null>(null);
  const [memberId, setMemberId] = useState<string>(members.find((m) => m.isSelf)?.id ?? members[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const key = (date: string, time: string) => `${date}|${time}`;

  const pick = (day: Day, time: string) => {
    const cell = cells[key(day.key, time)];
    if (!cell || cell.state !== "free" || !cell.id) return;
    setError(null);
    setFlash(null);
    setSel({ day, time, id: cell.id });
  };

  const confirm = async () => {
    if (!sel) return;
    if (!isAuthed) {
      setSel(null);
      openBook();
      return;
    }
    setBusy(true);
    const res = await bookSlot(sel.id, memberId || undefined);
    setBusy(false);
    if (res.ok) {
      const who = members.find((m) => m.id === memberId);
      setFlash(
        `Записали${who && !who.isSelf ? ` (${who.name})` : ""} на ${sel.day.dayLabel}, ${sel.day.dateLabel} в ${sel.time}. Занятие уже в личном кабинете.`
      );
      setSel(null);
      router.refresh();
    } else {
      setError(res.error ?? "Не удалось забронировать");
      setSel(null);
    }
  };

  const selectedMember = members.find((m) => m.id === memberId);

  return (
    <>
      {flash && <div className="flash" style={{ marginBottom: 16 }}>✓ {flash}</div>}
      {error && <p className="error-text" style={{ marginBottom: 14 }}>{error}</p>}

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
              const cell = cells[key(d.key, t)] ?? { state: "none" as CellState };
              const isSel = sel?.day.key === d.key && sel?.time === t;
              const cls =
                cell.state === "free" ? "s-free" :
                cell.state === "mine" ? "s-mine" : "s-booked";
              const label =
                cell.state === "free" ? (isSel ? "выбрано" : "") :
                cell.state === "mine" ? "★ ты" :
                cell.state === "booked" ? "—" : "";
              const dim =
                cell.state === "none" ? 0.3 :
                cell.state === "past" ? 0.45 :
                cell.state === "closed" ? 0.55 : undefined;
              return (
                <button
                  key={d.key}
                  className={"sch__slot " + cls + (isSel ? " sel" : "")}
                  onClick={() => pick(d, t)}
                  disabled={cell.state !== "free"}
                  style={dim ? { opacity: dim } : undefined}
                  title={
                    cell.state === "past" ? "время прошло" :
                    cell.state === "closed" ? "недоступно" :
                    cell.state === "none" ? "занятий нет" : undefined
                  }
                >
                  {label}
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
          <div className="wrap row between center" style={{ flexWrap: "wrap", gap: 14 }}>
            <div>
              <span className="muted upper">выбран слот</span>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {sel.day.dayLabel}, {sel.day.dateLabel} · {sel.time}
              </div>
            </div>

            {/* Кто занимается — показываем, только если на аккаунте несколько человек */}
            {isAuthed && members.length > 1 && (
              <div className="field" style={{ minWidth: 220 }}>
                <label>Кто занимается</label>
                <select className="input" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.isSelf ? `${m.name} (я)` : `${m.name} · ${m.relation}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="row gap12 center">
              <button className="btn btn--ghost btn--sm" onClick={() => setSel(null)} disabled={busy}>Отмена</button>
              <button className="btn btn--accent" onClick={confirm} disabled={busy}>
                {busy
                  ? "Бронируем…"
                  : selectedMember && !selectedMember.isSelf
                    ? `Записать ${selectedMember.name} →`
                    : "Забронировать →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
