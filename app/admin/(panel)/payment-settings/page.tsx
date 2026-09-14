import { prisma } from "@/lib/db";
import { decryptSecret, maskSecret } from "@/lib/crypto";
import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";

export default async function PaymentSettingsPage() {
  const settings = await prisma.paymentSettings.findUnique({ where: { id: 1 } });
  const savedKey = decryptSecret(settings?.secretKeyEnc);

  const envFallback = !!process.env.YOOKASSA_SHOP_ID && !!process.env.YOOKASSA_SECRET_KEY;
  const active = (settings?.enabled && settings.shopId && savedKey) || envFallback;
  const appUrl = process.env.APP_URL || "https://paul-english.ru";

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Приём платежей</h1>
          <p className="admin__sub">Реквизиты ЮKassa для оплаты пакетов на сайте.</p>
        </div>
        <span className={"badge" + (active ? " badge--new" : "")}>
          {active ? "платежи включены" : "демо-режим"}
        </span>
      </div>

      {!active && (
        <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
          <b>Сейчас оплата работает в демо-режиме.</b>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: 14 }}>
            Ученик нажимает «Оплатить», платёж сразу отмечается прошедшим и занятия
            начисляются, но деньги не списываются. Это удобно для проверки, а для
            настоящих оплат заполните реквизиты ниже.
          </p>
        </div>
      )}

      {settings?.lastCheckedAt && (
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          Последняя проверка: {new Date(settings.lastCheckedAt).toLocaleString("ru-RU")} —{" "}
          {settings.lastCheckOk ? "успешно" : `ошибка: ${settings.lastCheckError ?? "неизвестно"}`}
        </p>
      )}

      <PaymentSettingsForm
        shopId={settings?.shopId ?? ""}
        maskedKey={maskSecret(savedKey)}
        hasKey={!!savedKey}
        liveMode={settings?.liveMode ?? false}
        enabled={settings?.enabled ?? false}
      />

      <h2 className="serif" style={{ fontSize: 24, margin: "34px 0 12px" }}>Что указать в ЮKassa</h2>
      <div className="card" style={{ padding: "20px 22px" }}>
        <p style={{ marginTop: 0 }}>
          В личном кабинете ЮKassa → <b>Настройки → Уведомления</b> укажите адрес:
        </p>
        <p className="mono-num" style={{ wordBreak: "break-all", background: "var(--paper-2)", padding: "10px 12px", borderRadius: 4, margin: "0 0 12px" }}>
          {appUrl}/api/payments/webhook
        </p>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          События: <b>payment.succeeded</b> и <b>payment.canceled</b>. Без этого сайт не узнает
          об успешной оплате и не начислит занятия.
        </p>
      </div>

      <p className="muted" style={{ fontSize: 13, marginTop: 18 }}>
        Секретный ключ хранится в базе в зашифрованном виде и нигде не показывается целиком.
        Если реквизиты заданы и через переменные окружения сервера, приоритет у настроек здесь.
      </p>
    </>
  );
}
