"use client";

import { useState } from "react";
import { Arrow } from "./doodles";
import { BookButton } from "./CTAButtons";

export function Faq({ items }: { items: { id: number; q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);

  return (
    <section className="faq section" id="faq">
      <div className="wrap faq__grid">
        <div className="faq__aside">
          <span className="kicker" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ width: 30, height: 2, background: "var(--ink)" }}></span> Q &amp; A
          </span>
          <h2 className="display" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 0.92 }}>
            Частые<br />
            <span className="ital">вопросы</span>
          </h2>
          <Arrow w={120} h={90} sw={3} style={{ position: "static", marginTop: 20, transform: "rotate(40deg)" }} />
          <p className="muted" style={{ marginTop: 20 }}>Не нашёл свой вопрос?</p>
          <BookButton className="btn btn--ink">Просто спроси на пробном</BookButton>
        </div>

        <div className="faq__list">
          {items.map((f, i) => {
            const on = open === i;
            return (
              <div className={"qitem" + (on ? " open" : "")} key={f.id}>
                <button className="qitem__q" onClick={() => setOpen(on ? -1 : i)}>
                  <span>{f.q}</span>
                  <span className="qitem__plus">{on ? "−" : "+"}</span>
                </button>
                <div className="qitem__a" style={{ maxHeight: on ? 240 : 0 }}>
                  <p>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
