import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { logoutToAdminLogin } from "@/lib/actions/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Вход — админка Paul English" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ forbidden?: string }>;
}) {
  const [session, { forbidden }] = await Promise.all([auth(), searchParams]);
  if (session?.user?.role === "admin") redirect("/admin");

  // Вошли под учеником и пытаются открыть админку.
  if (session?.user && forbidden) {
    return (
      <div className="page cab-login" style={{ minHeight: "100vh" }}>
        <div className="cab-login__card card card--shadow">
          <span className="tag tag--ink">Нет доступа</span>
          <h1 className="display" style={{ fontSize: 38, lineHeight: 0.95, margin: "14px 0 6px" }}>
            Это админка
          </h1>
          <p className="muted" style={{ marginBottom: 20 }}>
            Вы вошли как <b>{session.user.name ?? session.user.email}</b> — это ученический аккаунт.
            Чтобы попасть в админку, выйдите и войдите под администратором.
          </p>
          <form action={logoutToAdminLogin}>
            <button className="btn btn--accent btn--lg" style={{ width: "100%", justifyContent: "center" }}>
              Выйти и войти как админ →
            </button>
          </form>
          <Link className="cab-login__demo" href="/cabinet" style={{ display: "block" }}>
            вернуться в личный кабинет
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page cab-login" style={{ minHeight: "100vh" }}>
      <AdminLoginForm />
    </div>
  );
}
