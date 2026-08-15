import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CabinetLogin } from "@/components/site/CabinetLogin";
import { CabinetDashboard } from "@/components/site/CabinetDashboard";
import type { PayTarget } from "@/components/site/Payment";

export const metadata = { title: "Личный кабинет — Paul English" };

export default async function CabinetPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return <CabinetLogin />;

  const { paid } = await searchParams;

  // У администратора нет ученического профиля — не показываем пустой кабинет.
  if (session.user.role === "admin") {
    return (
      <div className="page cab-login">
        <div className="cab-login__card card card--shadow">
          <span className="tag tag--ink">Вы вошли как администратор</span>
          <h1 className="display" style={{ fontSize: 38, lineHeight: 0.95, margin: "14px 0 6px" }}>
            Это кабинет ученика
          </h1>
          <p className="muted" style={{ marginBottom: 20 }}>
            У администратора нет расписания и журнала. Управление школой — в админке.
          </p>
          <Link className="btn btn--accent btn--lg" href="/admin" style={{ width: "100%", justifyContent: "center" }}>
            Перейти в админку →
          </Link>
        </div>
      </div>
    );
  }

  const [user, lessons, journal, materials, payments] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.lesson.findMany({ where: { userId: session.user.id }, orderBy: { order: "asc" } }),
    prisma.journalEntry.findMany({ where: { userId: session.user.id }, orderBy: { order: "asc" } }),
    prisma.studentMaterial.findMany({ where: { userId: session.user.id }, orderBy: { order: "asc" } }),
    prisma.payment.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!user) return <CabinetLogin />;

  let payTarget: PayTarget | null = null;
  if (user.packageName) {
    const pkg = await prisma.package.findFirst({ where: { name: user.packageName } });
    if (pkg && pkg.priceAmount > 0) {
      payTarget = { packageName: pkg.name, period: pkg.per, amount: pkg.priceAmount };
    }
  }

  const stats = {
    journal: journal.length,
    upcoming: lessons.filter((l) => l.status !== "done").length,
    lastMark: journal[0]?.mark ?? "—",
    paid: payments.filter((p) => p.status === "paid").length,
  };

  return (
    <CabinetDashboard
      name={user.name}
      packageName={user.packageName}
      lessons={lessons.map((l) => ({ id: l.id, time: l.time, dateLabel: l.dateLabel, topic: l.topic, status: l.status }))}
      journal={journal.map((j) => ({ id: j.id, mark: j.mark, topic: j.topic, date: j.date, note: j.note }))}
      materials={materials.map((m) => ({ id: m.id, tag: m.tag, title: m.title, size: m.size, fileUrl: m.fileUrl }))}
      payments={payments.map((p) => ({ id: p.id, period: p.period, amount: p.amount, status: p.status, packageName: p.packageName }))}
      payTarget={payTarget}
      stats={stats}
      paidBanner={paid === "1"}
    />
  );
}
