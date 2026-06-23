import Link from "next/link";
import { prisma } from "@/lib/db";
import { Spark } from "@/components/site/doodles";

export const metadata = { title: "Материалы — Pavel English" };

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="page">
      <div className="page__hero">
        <div className="wrap">
          <span className="kicker" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 30, height: 2, background: "var(--ink)" }}></span> Полезные материалы
          </span>
          <h1 className="display" style={{ fontSize: "clamp(40px,6vw,76px)", lineHeight: 0.95 }}>
            Бери и <span className="hl">пользуйся</span>
          </h1>
          <p className="muted" style={{ fontSize: 18, marginTop: 14, maxWidth: "34em" }}>
            Бесплатная подборка, которую я даю ученикам. Скачивай без регистрации — это подарок.
          </p>
        </div>
      </div>

      <div className="wrap section--tight">
        <div className="mgrid">
          {materials.map((m) => (
            <div className="mcard card" key={m.id}>
              <div className="row between center">
                <span className="tag tag--ink">{m.tag}</span>
                <Spark s={20} style={{ position: "static" }} />
              </div>
              <h3 className="serif" style={{ fontSize: 28, lineHeight: 1, marginTop: 14 }}>{m.title}</h3>
              <p className="muted" style={{ fontSize: 15, margin: "8px 0 0" }}>{m.desc}</p>
              <div className="row between center" style={{ marginTop: 18 }}>
                <span className="muted" style={{ fontSize: 13 }}>{m.size}</span>
                {m.fileUrl ? (
                  <a className="btn btn--sm" href={m.fileUrl} target="_blank" rel="noreferrer" download>Скачать ↓</a>
                ) : (
                  <button className="btn btn--sm" disabled>Скоро ↓</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mcta card card--shadow">
          <div>
            <h3 className="display" style={{ fontSize: 34 }}>Хочешь материалы под свою цель?</h3>
            <p className="muted" style={{ margin: "8px 0 0" }}>Ученики получают персональную подборку в личном кабинете.</p>
          </div>
          <Link className="btn btn--accent btn--lg" href="/cabinet">Открыть кабинет →</Link>
        </div>
      </div>
    </div>
  );
}
