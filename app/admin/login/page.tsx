import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Вход — админка Pavel English" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === "admin") redirect("/admin");

  return (
    <div className="page cab-login" style={{ minHeight: "100vh" }}>
      <AdminLoginForm />
    </div>
  );
}
