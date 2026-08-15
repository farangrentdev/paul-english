"use client";

import { useState, useTransition } from "react";
import { openPeriod } from "@/lib/admin/schedule-actions";

export function OpenPeriodForm({
  teacherId,
  monday,
  weekLabelText,
}: {
  teacherId: number;
  monday: string;
  weekLabelText: string;
}) {
  const [weeks, setWeeks] = useState(1);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const run = () => {
    setResult(null);
    start(async () => {
      const res = await openPeriod(teacherId, monday, weeks);
      setResult(
        res.created > 0
          ? `Открыто слотов: ${res.created}`
          : "Новых слотов нет — период уже открыт (или пустое стандартное расписание)"
      );
    });
  };

  return (
    <div className="card" style={{ padding: "20px 22px", marginBottom: 20 }}>
      <div className="row between center gap16" style={{ flexWrap: "wrap" }}>
        <div>
          <b style={{ fontSize: 17 }}>Открыть период по стандартному расписанию</b>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: 14 }}>
            Начиная с недели «{weekLabelText}». Уже открытые слоты и брони не пострадают.
          </p>
        </div>
        <div className="row gap12 center" style={{ flexWrap: "wrap" }}>
          <div className="field" style={{ minWidth: 150 }}>
            <label>Сколько недель</label>
            <select
              className="input"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              disabled={pending}
            >
              {[1, 2, 4, 8, 12].map((n) => (
                <option key={n} value={n}>{n} нед.</option>
              ))}
            </select>
          </div>
          <button className="btn btn--accent" style={{ marginTop: 22 }} onClick={run} disabled={pending}>
            {pending ? "Открываем…" : "Открыть период →"}
          </button>
        </div>
      </div>
      {result && <p className="flash" style={{ margin: "14px 0 0" }}>{result}</p>}
    </div>
  );
}
