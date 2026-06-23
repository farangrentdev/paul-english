"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Spark, Star } from "./doodles";
import { createLead } from "@/lib/actions/leads";

const BK_LEVELS = ["С нуля", "Beginner / A1", "Elementary / A2", "Intermediate / B1–B2", "Advanced / C1+", "Не знаю свой уровень"];
const BK_GOALS = ["Разговор без барьера", "Экзамен (ЕГЭ/IELTS…)", "Английский для работы", "Путешествия", "Переезд за границу", "Для ребёнка", "Просто для себя"];
const BK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const BK_TIMES = ["Утро", "День", "Вечер"];
const BK_CONTACT = ["Telegram", "WhatsApp", "Звонок", "Email"];

type Data = {
  name: string;
  contactVal: string;
  contact: string;
  level: string;
  goals: string[];
  days: string[];
  time: string;
};

export function Booking({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<Data>({
    name: "",
    contactVal: "",
    contact: "Telegram",
    level: "",
    goals: [],
    days: [],
    time: "",
  });

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setData((d) => ({ ...d, [k]: v }));
  const toggle = (k: "goals" | "days", v: string) =>
    setData((d) => ({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] }));

  const steps = ["Знакомство", "Уровень", "Цель", "Время"];
  const canNext =
    step === 0 ? data.name.trim() && data.contactVal.trim() :
    step === 1 ? !!data.level :
    step === 2 ? data.goals.length > 0 :
    step === 3 ? data.days.length > 0 && !!data.time : true;

  const done = step === 4;

  const submit = async () => {
    setSubmitting(true);
    try {
      await createLead(data);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 3) submit();
    else setStep(step + 1);
  };

  return (
    <Modal onClose={onClose} wide>
      {!done && (
        <div className="bk">
          <div className="bk__head">
            <span className="tag tag--accent">Бесплатное пробное · 40 мин</span>
            <h2 className="display" style={{ fontSize: 38, marginTop: 12 }}>Запишемся на пробное</h2>
            <div className="bk__steps">
              {steps.map((s, i) => (
                <div className={"bk__stepdot" + (i === step ? " on" : "") + (i < step ? " done" : "")} key={i}>
                  <span>{i < step ? "✓" : i + 1}</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="bk__body">
            {step === 0 && (
              <div className="bk__form">
                <div className="field">
                  <label>Как тебя зовут?</label>
                  <input className="input" placeholder="Имя" value={data.name} onChange={(e) => set("name", e.target.value)} autoFocus />
                </div>
                <div className="field">
                  <label>Куда написать?</label>
                  <div className="bk__chips">
                    {BK_CONTACT.map((c) => (
                      <button key={c} className="chip" data-on={data.contact === c} onClick={() => set("contact", c)}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>{data.contact === "Email" ? "Твой email" : data.contact === "Звонок" ? "Номер телефона" : "Ник или номер"}</label>
                  <input
                    className="input"
                    placeholder={data.contact === "Telegram" ? "@username" : data.contact === "Email" ? "you@mail.ru" : "+7 ..."}
                    value={data.contactVal}
                    onChange={(e) => set("contactVal", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bk__opts">
                {BK_LEVELS.map((l) => (
                  <button key={l} className="bk__opt" data-on={data.level === l} onClick={() => set("level", l)}>
                    <span className="bk__optdot"></span>
                    {l}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <>
                <p className="muted" style={{ marginTop: -4 }}>Можно выбрать несколько — это поможет собрать программу.</p>
                <div className="bk__chips">
                  {BK_GOALS.map((g) => (
                    <button key={g} className="chip" data-on={data.goals.includes(g)} onClick={() => toggle("goals", g)}>{g}</button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <div className="bk__form">
                <div className="field">
                  <label>Удобные дни</label>
                  <div className="bk__chips">
                    {BK_DAYS.map((d) => (
                      <button key={d} className="chip" data-on={data.days.includes(d)} onClick={() => toggle("days", d)}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Время суток</label>
                  <div className="bk__chips">
                    {BK_TIMES.map((t) => (
                      <button key={t} className="chip" data-on={data.time === t} onClick={() => set("time", t)}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bk__foot">
            <button className="btn btn--ghost" onClick={() => (step === 0 ? onClose() : setStep(step - 1))}>
              {step === 0 ? "Отмена" : "← Назад"}
            </button>
            <button className="btn btn--accent" disabled={!canNext || submitting} onClick={next}>
              {step === 3 ? (submitting ? "Отправляем…" : "Отправить заявку →") : "Дальше →"}
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="bk__done">
          <div className="bk__check">✓</div>
          <Spark s={30} style={{ position: "absolute", top: 30, left: "30%" }} />
          <Star s={24} style={{ position: "absolute", top: 50, right: "28%", opacity: 0.7 }} />
          <h2 className="display" style={{ fontSize: 46 }}>Заявка улетела!</h2>
          <p className="bk__donep">
            {data.name ? data.name + ", я" : "Я"} напишу тебе в <b>{data.contact}</b> в течение часа, подберём точное время и
            созвонимся. Пробное — бесплатно, ни к чему не обязывает.
          </p>
          <div className="bk__summary">
            <div><span className="muted">Уровень</span><b>{data.level || "—"}</b></div>
            <div><span className="muted">Цель</span><b>{data.goals.join(", ") || "—"}</b></div>
            <div><span className="muted">Когда</span><b>{data.days.join(", ")} · {data.time}</b></div>
          </div>
          <button className="btn btn--ink btn--lg" onClick={onClose}>Отлично, жду!</button>
        </div>
      )}
    </Modal>
  );
}
