import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Админка — Paul English" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  // Вошли под учеником — не уводим молча в кабинет, а объясняем на странице входа.
  if (session.user.role !== "admin") redirect("/admin/login?forbidden=1");

  const newLeads = await prisma.lead.count({ where: { status: "new" } });

  return (
    <div className="admin">
      <AdminNav newLeads={newLeads} />
      <main className="admin__main">{children}</main>
    </div>
  );
}
