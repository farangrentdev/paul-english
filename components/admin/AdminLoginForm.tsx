"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const action = loginAction.bind(null, "/admin", true);

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(action, {});

  return (
    <form className="cab-login__card card card--shadow" action={formAction}>
      <span className="tag tag--ink">Админка · Pavel English</span>
      <h1 className="display" style={{ fontSize: 40, lineHeight: 0.95, margin: "14px 0 6px" }}>Вход для администратора</h1>
      <p className="muted" style={{ marginBottom: 22 }}>Управление контентом, заявками, учениками и платежами.</p>

      <div className="field" style={{ marginBottom: 14 }}>
        <label>Email</label>
        <input className="input" name="email" placeholder="admin@pavelenglish.ru" autoComplete="username" />
      </div>
      <div className="field" style={{ marginBottom: 20 }}>
        <label>Пароль</label>
        <input className="input" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
      </div>

      {state?.error && <p className="error-text" style={{ marginBottom: 12 }}>{state.error}</p>}

      <button className="btn btn--ink btn--lg" style={{ width: "100%", justifyContent: "center" }} disabled={pending}>
        {pending ? "Входим…" : "Войти →"}
      </button>
    </form>
  );
}
