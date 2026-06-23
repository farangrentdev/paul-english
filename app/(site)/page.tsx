import type { ReactNode } from "react";
import { getLandingData } from "@/lib/content";
import { parseList } from "@/lib/json";
import { Marquee } from "@/components/site/Nav";
import { Faq } from "@/components/site/Faq";
import { BookButton, PayButton } from "@/components/site/CTAButtons";
import { Arrow, ArrowDown, Scratch, Spark, Star, Underline } from "@/components/site/doodles";

function SectionHead({ kicker, title, right, id }: { kicker: string; title: ReactNode; right?: ReactNode; id?: string }) {
  return (
    <div className="shead" id={id}>
      <div className="shead__l">
        <span className="kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {right}
    </div>
  );
}

export default async function HomePage() {
  const { settings, benefits, lessons, packages, promos, team, reviews, faq } = await getLandingData();
  const awards = parseList(settings.awards);
  const aboutBody = parseList(settings.aboutBody);

  return (
    <>
      {/* ===== HERO ===== */}
      <header className="hero">
        <Spark s={34} style={{ position: "absolute", top: 96, left: "7%" }} />
        <Star s={26} sw={2.6} style={{ position: "absolute", top: 150, right: "9%", opacity: 0.7 }} />

        <div className="wrap hero__grid">
          <div className="hero__copy">
            <div className="row center gap12" style={{ marginBottom: 26 }}>
              <span className="tag tag--ink">Частная школа английского</span>
              <span className="hand" style={{ fontSize: 22, color: "var(--ink-soft)" }}>est. 2016 · онлайн по всему миру</span>
            </div>

            <h1 className="display hero__title">
              Английский,<br />
              который<br />
              <span className="relative" style={{ display: "inline-block" }}>
                <span className="ital">наконец-то</span>{" "}
                <span className="hl">заговорит</span>
                <Underline w={360} h={26} sw={5} style={{ position: "absolute", left: 0, bottom: -20, width: "100%" }} />
              </span>
            </h1>

            <p className="hero__lead">
              Привет, я <b>{settings.teacherName}</b>. Учу говорить людей, которые «учили английский 10 лет и всё равно
              молчат». Без скучных учебников, со смыслом и по-человечески.
            </p>

            <div className="row gap16 center hero__cta">
              <BookButton className="btn btn--accent btn--lg">
                Бесплатное пробное <span aria-hidden>→</span>
              </BookButton>
              <a className="btn btn--ghost btn--lg" href="#lessons">Какие бывают занятия</a>
            </div>

            <div className="hero__stats">
              {awards.map((a, i) => (
                <div className="hero__stat" key={i}>
                  <Spark s={18} style={{ position: "static" }} />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero__photo">
            <div className="hand hero__note hero__note--1">
              это он, {settings.teacherName}<br />
              <span style={{ fontSize: "0.7em" }}>(не кусается)</span>
            </div>
            <Arrow w={120} h={92} sw={3} style={{ position: "absolute", top: -6, left: -86, transform: "rotate(8deg)" }} />

            <span className="tape" style={{ top: -13, left: 38 }}></span>
            <span className="tape" style={{ top: -13, right: 38, transform: "rotate(5deg)" }}></span>

            <div className="hero__frame card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.heroPhotoUrl} alt={`${settings.teacherName}, преподаватель английского`} className="bw" />
              <div className="hero__badge" style={{ margin: "0px 14px 0px 0px" }}>
                <span className="hand" style={{ fontSize: 30, lineHeight: 0.9 }}>«Учитель<br />года» ×4</span>
              </div>
            </div>

            <div className="hand hero__note hero__note--2" style={{ color: "rgb(245, 243, 236)" }}>
              спрашивай что угодно —<br />отвечу по-русски 🙂
            </div>
          </div>
        </div>

        <div className="hero__scroll">
          <ArrowDown w={42} h={84} sw={2.6} style={{ position: "static" }} />
          <span className="upper muted">листай</span>
        </div>
      </header>

      <Marquee />

      {/* ===== ABOUT ===== */}
      <section className="about section" id="about">
        <div className="wrap about__grid">
          <div className="about__photo">
            <span className="tape" style={{ top: -12, left: "42%" }}></span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.heroPhotoUrl} alt={settings.teacherName} />
            <div className="hand" style={{ position: "absolute", bottom: -26, right: -10, fontSize: 26, transform: "rotate(-4deg)", background: "var(--accent)", border: "1.5px solid var(--ink)", padding: "4px 12px" }}>
              10 лет в деле
            </div>
          </div>

          <div>
            <span className="kicker" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ width: 30, height: 2, background: "var(--ink)" }}></span> Обо мне
            </span>
            <p className="about__lead">{settings.aboutLead}</p>
            <div className="about__body">
              {aboutBody.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="about__sign">— {settings.teacherName}</div>
          </div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="section wrap" id="benefits">
        <SectionHead
          kicker="Почему со мной"
          title={<>Что ты получишь,<br />кроме <span className="ital">грамматики</span></>}
          right={<Scratch w={70} h={70} style={{ position: "static", opacity: 0.5 }} />}
        />
        <div className="bgrid">
          {benefits.map((b) => (
            <div className="bcell" key={b.id}>
              <div className="bcell__n">{b.n}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ===== LESSONS ===== */}
      <section className="section wrap" id="lessons">
        <SectionHead
          kicker="Виды занятий"
          title={<>Найди <span className="hl">свой</span> формат</>}
          right={<p className="muted" style={{ maxWidth: "22em", margin: 0, fontSize: 16 }}>Кому бы ни был нужен английский — у меня есть под это занятие. А на пробном решим, что подходит именно тебе.</p>}
        />
        <div className="lgrid">
          {lessons.map((l, i) => (
            <div className="lcard card" key={l.id}>
              <div className="row between center">
                <span className="tag tag--accent">{l.tag}</span>
                <span className="idx muted">0{i + 1}</span>
              </div>
              <h3>{l.title}</h3>
              <p>{l.desc}</p>
              <div className="lcard__meta">
                <span>⏱ {l.dur}</span>
                <span>◇ {l.who}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="pricing section" id="pricing">
        <div className="wrap">
          <SectionHead
            kicker="Цены и пакеты"
            title={<>Плати за <span className="ital">результат</span>,<br />а не за воздух</>}
            right={<p className="muted" style={{ maxWidth: "20em", margin: 0, fontSize: 16 }}>Чем больше занятий — тем дешевле каждое. Никаких скрытых платежей и «звёздочек».</p>}
          />

          <div className="promos">
            {promos.map((p) => (
              <div className="promo" key={p.id}>
                <div className="promo__big display">{p.big}</div>
                <div>
                  <div className="promo__t">{p.title}</div>
                  <div className="promo__d">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pgrid">
            {packages.map((p) => {
              const feats = parseList(p.feats);
              const btnClass = "btn " + (p.accent ? "btn--accent" : p.isTrial ? "btn--ink" : "");
              return (
                <div className={"pcard card" + (p.accent ? " pcard--hot" : "")} key={p.id}>
                  {p.popular && <div className="pcard__ribbon hand">хит ⭐</div>}
                  <div className="pcard__name">{p.name}</div>
                  <div className="pcard__price display">{p.price}</div>
                  <div className="pcard__per muted">{p.per}</div>
                  <div className="pcard__note">{p.note}</div>
                  <hr className="divider" style={{ opacity: 0.2, margin: "4px 0 16px" }} />
                  <ul className="pcard__feats">
                    {feats.map((f, j) => (
                      <li key={j}><span aria-hidden>✓</span> {f}</li>
                    ))}
                  </ul>
                  {p.isTrial ? (
                    <BookButton className={btnClass} style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}>
                      {p.cta}
                    </BookButton>
                  ) : (
                    <PayButton
                      target={{ packageName: p.name, period: p.per, amount: p.priceAmount }}
                      className={btnClass}
                      style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
                    >
                      {p.cta}
                    </PayButton>
                  )}
                </div>
              );
            })}
          </div>

          <p className="muted" style={{ textAlign: "center", marginTop: 26, fontSize: 14 }}>
            Оплата картой прямо на сайте · рассрочка по запросу · напоминания об оплате в личном кабинете
          </p>
        </div>
      </section>

      {/* ===== TEACHERS ===== */}
      <section className="teachers section" id="teachers">
        <div className="wrap">
          <SectionHead
            kicker="Наши педагоги"
            title={<>Маленькая команда,<br />большая <span className="hl">любовь</span> к делу</>}
            right={<div className="hand" style={{ fontSize: 24, color: "var(--ink-soft)", maxWidth: "14em", transform: "rotate(-2deg)" }}>каждого выбирал лично — <br />и за каждого ручаюсь →</div>}
          />
          <div className="tgrid">
            {team.map((m, i) => {
              const tags = parseList(m.tags);
              return (
                <div className={"tcard card" + (m.hero ? " tcard--hero" : "")} key={m.id}>
                  <div className="tcard__photo">
                    {m.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photoUrl} alt={m.name} className={m.hero ? "bw" : undefined} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper-2)", color: "var(--muted)", fontWeight: 700, textAlign: "center", padding: 12 }}>
                        Фото · {m.name}
                      </div>
                    )}
                    {m.hero && <span className="tcard__crown hand">основатель</span>}
                  </div>
                  <div className="tcard__body">
                    <div className="row between center">
                      <h3>{m.name}</h3>
                      <span className="idx muted">0{i + 1}</span>
                    </div>
                    <div className="tcard__role">{m.role}</div>
                    <p className="tcard__note">{m.note}</p>
                    <div className="tcard__tags">
                      {tags.map((t, j) => (
                        <span className="tag" key={j}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="reviews section" id="reviews">
        <div className="wrap">
          <SectionHead
            kicker="Отзывы"
            title={<>Говорят <span className="ital">ученики</span></>}
            right={
              <div className="row center gap12">
                <div className="display" style={{ fontSize: 54, lineHeight: 1 }}>{settings.reviewsScore}</div>
                <div className="col" style={{ gap: 2 }}>
                  <span className="stars" aria-label="5 из 5">★★★★★</span>
                  <span className="muted" style={{ fontSize: 14 }}>{settings.reviewsCount}</span>
                </div>
              </div>
            }
          />
        </div>

        <div className="rscroll">
          <div className="rscroll__track">
            {reviews.map((r) => (
              <figure className="rcard card" key={r.id}>
                <span className="stars" aria-label={`${r.stars} из 5`}>{"★".repeat(r.stars)}</span>
                <blockquote>{r.text}</blockquote>
                <figcaption>
                  <span className="ravatar">{r.name[0]}</span>
                  <span>
                    <b>{r.name}</b><br />
                    <span className="muted" style={{ fontSize: 13 }}>{r.who}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <p className="muted" style={{ textAlign: "center", marginTop: 24, fontSize: 14 }}>
          ← листай отзывы пальцем / трекпадом · все отзывы реальны
        </p>
      </section>

      {/* ===== FAQ ===== */}
      <Faq items={faq} />

      {/* ===== CTA ===== */}
      <section className="cta section" id="contacts">
        <div className="wrap cta__box">
          <Spark s={40} style={{ position: "absolute", top: 24, right: 36 }} />
          <Star s={28} style={{ position: "absolute", bottom: 30, left: 40, opacity: 0.8 }} />
          <span className="hand" style={{ fontSize: 26, color: "var(--accent)" }}>ну что, рискнём?</span>
          <h2 className="display cta__title">
            Первое занятие —<br />
            <span className="hl" style={{ color: "var(--ink)" }}>бесплатно</span>. Без карты.
          </h2>
          <p className="cta__lead">40 минут, чтобы понять твой уровень, цель и подходим ли мы друг другу. Дальше — только если захочешь.</p>
          <div className="row gap16 center" style={{ flexWrap: "wrap", justifyContent: "center" }}>
            <BookButton className="btn btn--accent btn--lg">Записаться на пробное →</BookButton>
            <a className="btn btn--ghost btn--lg" href={`https://t.me/${settings.telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--paper)", borderColor: "var(--paper)" }}>Написать в Telegram</a>
          </div>
        </div>
      </section>
    </>
  );
}
