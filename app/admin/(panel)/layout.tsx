import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Админка — Pavel English" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/cabinet");

  const newLeads = await prisma.lead.count({ where: { status: "new" } });

  return (
    <div className="admin">
      <AdminNav newLeads={newLeads} />
      <main className="admin__main">{children}</main>
    </div>
  );
}
