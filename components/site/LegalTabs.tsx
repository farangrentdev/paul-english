"use client";

import { useState } from "react";

type Doc = { key: string; title: string; body: string[] };

export function LegalTabs({ docs }: { docs: Doc[] }) {
  const [tab, setTab] = useState(docs[0]?.key ?? "");
  const cur = docs.find((d) => d.key === tab) ?? docs[0];
  if (!cur) return null;

  return (
    <div className="wrap section--tight">
      <div className="leg__tabs">
        {docs.map((d) => (
          <button key={d.key} className={"leg__tab" + (tab === d.key ? " on" : "")} onClick={() => setTab(d.key)}>
            {d.title}
          </button>
        ))}
      </div>
      <div className="leg__doc card">
        <h2 className="serif" style={{ fontSize: 32, marginBottom: 18 }}>{cur.title}</h2>
        {cur.body.map((p, i) => (
          <p key={i} style={{ fontSize: 16.5, color: "var(--ink-soft)", marginBottom: 14 }}>{p}</p>
        ))}
      </div>
    </div>
  );
}
