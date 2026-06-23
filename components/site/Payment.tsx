"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "./Modal";

export type PayTarget = { packageName: string; period: string; amount: number };

export function Payment({
  target,
  isAuthed,
  onClose,
}: {
  target: PayTarget;
  isAuthed: boolean;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"form" | "processing">("form");
  const [error, setError] = useState<string | null>(null);

  const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

  const pay = async () => {
    setStage("processing");
    setError(null);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });
      const data = await res.json();
      if (!res.ok || !data.confirmationUrl) {
        throw new Error(data.error || "Не удалось создать платёж");
      }
      window.location.href = data.confirmationUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка оплаты");
      setStage("form");
    }
  };

  return (
    <Modal onClose={stage === "processing" ? () => {} : onClose}>
      {stage === "form" && (
        <div className="pay">
          <span className="tag tag--accent">Оплата на сайте</span>
          <h2 className="display" style={{ fontSize: 36, margin: "12px 0 4px" }}>
            Пакет «{target.packageName}»
          </h2>
          <div className="pay__sum">
            <span className="muted">{target.period}</span>
            <span className="display" style={{ fontSize: 34 }}>{fmt(target.amount)}</span>
          </div>

          {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}

          {isAuthed ? (
            <>
              <button
                className="btn btn--accent btn--lg"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={pay}
              >
                Оплатить {fmt(target.amount)}
              </button>
              <p className="muted" style={{ fontSize: 12, textAlign: "center", marginTop: 12, marginBottom: 0 }}>
                🔒 Оплата картой на защищённой странице ЮKassa · данные карты не хранятся у нас
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 16, margin: "4px 0 16px" }}>
                Чтобы оплатить пакет, войдите в личный кабинет — там же появятся чек и расписание.
              </p>
              <Link
                href="/cabinet"
                className="btn btn--accent btn--lg"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={onClose}
              >
                Войти в кабинет →
              </Link>
            </>
          )}
        </div>
      )}

      {stage === "processing" && (
        <div className="pay__processing">
          <div className="pay__spin"></div>
          <p style={{ fontWeight: 700, fontSize: 18 }}>Готовим оплату…</p>
          <span className="muted">Перенаправляем на страницу банка</span>
        </div>
      )}
    </Modal>
  );
}
