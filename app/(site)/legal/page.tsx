import { prisma } from "@/lib/db";
import { parseList } from "@/lib/json";
import { LegalTabs } from "@/components/site/LegalTabs";

export const metadata = { title: "Юридическая информация — Pavel English" };

export default async function LegalPage() {
  const rows = await prisma.legalDoc.findMany({ orderBy: { order: "asc" } });
  const docs = rows.map((d) => ({ key: d.key, title: d.title, body: parseList(d.body) }));

  return (
    <div className="page">
      <div className="page__hero">
        <div className="wrap">
          <span className="kicker" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 30, height: 2, background: "var(--ink)" }}></span> Юридическая информация
          </span>
          <h1 className="display" style={{ fontSize: "clamp(36px,5vw,64px)", lineHeight: 0.95 }}>Всё по-честному</h1>
        </div>
      </div>
      <LegalTabs docs={docs} />
    </div>
  );
}
