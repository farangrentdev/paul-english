"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";
import { Arrow } from "./doodles";

const action = loginAction.bind(null, "/cabinet", false);

export function CabinetLogin() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(action, {});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillDemo = () => {
    setEmail("anna@example.com");
    setPassword("demo12345");
  };

  return (
    <div className="page cab-login">
      <form className="cab-login__card card card--shadow" action={formAction}>
        <span className="tag tag--accent">Личный кабинет</span>
        <h1 className="display" style={{ fontSize: 46, lineHeight: 0.95, margin: "14px 0 6px" }}>С возвращением 👋</h1>
        <p className="muted" style={{ marginBottom: 22 }}>Здесь — расписание, журнал, материалы и оплата.</p>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Email или телефон</label>
          <input className="input" name="email" placeholder="you@mail.ru" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </div>
        <div className="field" style={{ marginBottom: 20 }}>
          <label>Пароль</label>
          <input className="input" name="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>

        {state?.error && <p className="error-text" style={{ marginBottom: 12 }}>{state.error}</p>}

        <button className="btn btn--accent btn--lg" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
          {pending ? "Входим…" : "Войти →"}
        </button>
        <button type="button" className="cab-login__demo" onClick={fillDemo}>
          подставить демо-ученика Анну
        </button>
      </form>
      <Arrow w={120} h={90} style={{ position: "absolute", bottom: 60, right: "18%", opacity: 0.4, transform: "rotate(120deg)" }} />
    </div>
  );
}
