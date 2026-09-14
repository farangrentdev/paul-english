"use client";

import { useActionState, useState, useTransition } from "react";
import {
  savePaymentSettings,
  checkPaymentSettings,
  type PaymentFormState,
} from "@/lib/admin/payment-actions";

export function PaymentSettingsForm({
  shopId,
  maskedKey,
  hasKey,
  liveMode,
  enabled,
}: {
  shopId: string;
  maskedKey: string;
  hasKey: boolean;
  liveMode: boolean;
  enabled: boolean;
}) {
  const [state, formAction, pending] = useActionState<PaymentFormState, FormData>(
    savePaymentSettings,
    {}
  );
  const [checking, startCheck] = useTransition();
  const [checkResult, setCheckResult] = useState<PaymentFormState | null>(null);
  const [showKey, setShowKey] = useState(false);

  const runCheck = () => {
    setCheckResult(null);
    startCheck(async () => setCheckResult(await checkPaymentSettings()));
  };

  const msg = checkResult ?? state;

  return (
    <>
      {msg?.ok && <div className="flash">✓ {msg.ok}</div>}
      {msg?.error && (
        <div className="flash" style={{ background: "#ffe3e0" }}>⚠ {msg.error}</div>
      )}

      <form className="aform" action={formAction}>
        <div className="field">
          <label>shopId (идентификатор магазина)</label>
          <input
            className="input mono-num"
            name="shopId"
            defaultValue={shopId}
            placeholder="123456"
            autoComplete="off"
          />
          <span className="muted" style={{ fontSize: 12 }}>
            ЛК ЮKassa → Настройки → Магазин
          </span>
        </div>

        <div className="field">
          <label>Секретный ключ</label>
          <input
            className="input"
            name="secretKey"
            type={showKey ? "text" : "password"}
            placeholder={hasKey ? `сохранён: ${maskedKey} — оставьте пустым` : "live_… или test_…"}
            autoComplete="new-password"
          />
          <div className="row between center gap12" style={{ flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 12 }}>
              {hasKey
                ? "Ключ уже сохранён. Заполните поле, только если хотите его заменить."
                : "ЛК ЮKassa → Настройки → Ключи API"}
            </span>
            <button
              type="button"
              className="linklike"
              style={{ fontSize: 12 }}
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? "скрыть" : "показать ввод"}
            </button>
          </div>
        </div>

        <label className="aform__check">
          <input type="checkbox" name="liveMode" defaultChecked={liveMode} />
          Боевой магазин (снято — тестовый)
        </label>

        <label className="aform__check">
          <input type="checkbox" name="enabled" defaultChecked={enabled} />
          Принимать реальные платежи
        </label>
        <span className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          Пока выключено, кнопка оплаты работает в демо-режиме: заказ отмечается
          оплаченным, деньги не списываются. При включении реквизиты проверяются.
        </span>

        <div className="aform__actions">
          <button className="btn btn--accent" disabled={pending}>
            {pending ? "Сохраняем…" : "Сохранить"}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={runCheck}
            disabled={checking || pending}
          >
            {checking ? "Проверяем…" : "Проверить связь"}
          </button>
        </div>
      </form>
    </>
  );
}
