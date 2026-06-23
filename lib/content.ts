import { prisma } from "@/lib/db";

export async function getSettings() {
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (s) return s;
  // дефолт, если строка ещё не засеяна
  return {
    id: 1,
    teacherName: "Павел",
    teacherRole: "Преподаватель английского · автор методики",
    tagline: "Английский, который наконец-то заговорит",
    awards: "[]",
    heroPhotoUrl: "/uploads/pavel.jpg",
    aboutLead: "",
    aboutBody: "[]",
    reviewsScore: "4.9",
    reviewsCount: "120+ оценок",
    email: "hello@pavelenglish.ru",
    phone: "+7 (000) 000-00-00",
    telegram: "@pavelenglish",
    socials: "[]",
    footerLegal: "© 2026 Pavel English",
    updatedAt: new Date(),
  };
}

export async function getLandingData() {
  const [settings, benefits, lessons, packages, promos, team, reviews, faq] =
    await Promise.all([
      getSettings(),
      prisma.benefit.findMany({ orderBy: { order: "asc" } }),
      prisma.lessonType.findMany({ orderBy: { order: "asc" } }),
      prisma.package.findMany({ orderBy: { order: "asc" } }),
      prisma.promo.findMany({ orderBy: { order: "asc" } }),
      prisma.teamMember.findMany({ orderBy: { order: "asc" } }),
      prisma.review.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
      prisma.faq.findMany({ orderBy: { order: "asc" } }),
    ]);
  return { settings, benefits, lessons, packages, promos, team, reviews, faq };
}
