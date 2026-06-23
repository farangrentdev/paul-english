"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type LoginState = { error?: string };

// redirectTo биндится через .bind(null, "/cabinet" | "/admin")
export async function loginAction(
  redirectTo: string,
  requireAdmin: boolean,
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Заполните оба поля" };

  // Для входа в админку — проверяем роль заранее (понятная ошибка).
  if (requireAdmin) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: email }] },
    });
    if (!user || user.role !== "admin") {
      return { error: "Нет доступа к админке" };
    }
  }

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Неверный логин или пароль" };
    }
    throw e; // NEXT_REDIRECT должен пробрасываться
  }
  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
