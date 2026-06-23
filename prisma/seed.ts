import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const J = (arr: unknown[]) => JSON.stringify(arr);

async function main() {
  // ── SiteSettings (singleton) ──
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      teacherName: "Павел",
      teacherRole: "Преподаватель английского · автор методики",
      tagline: "Английский, который наконец-то заговорит",
      awards: J(["«Учитель года» — 4×", "10 лет практики", "300+ учеников"]),
      heroPhotoUrl: "/uploads/pavel.jpg",
      aboutLead:
        "Я не верю в «выучи правило — потом заговоришь». Сначала ты говоришь — а правила приходят следом, как друзья на вечеринку.",
      aboutBody: J([
        "Четыре раза становился «Учителем года», но горжусь не дипломами, а тем, что мои ученики перестают бояться открыть рот. За 10 лет через меня прошли три сотни человек — от семилеток до директоров, которым английский нужен «ещё вчера».",
        "Веду и в школе, и частно. Online — из любой точки мира, офлайн — по настроению и географии. Главное правило на занятиях: ошибаться можно и нужно. Молчать — нельзя.",
      ]),
      reviewsScore: "4.9",
      reviewsCount: "120+ оценок",
      email: "hello@pavelenglish.ru",
      phone: "+7 (000) 000-00-00",
      telegram: "@pavelenglish",
      socials: J([
        { label: "Telegram", url: "#" },
        { label: "Instagram", url: "#" },
        { label: "YouTube", url: "#" },
        { label: "VK", url: "#" },
      ]),
      footerLegal: "© 2026 Pavel English · ИП Петров П. П. · ИНН 000000000000",
    },
  });

  // ── Benefits ──
  await prisma.benefit.deleteMany();
  await prisma.benefit.createMany({
    data: [
      { n: "01", title: "Говоришь с первого занятия", desc: "Никакого «сначала выучи 500 слов». Речь — с порога, ошибки — это нормально и даже полезно.", order: 0 },
      { n: "02", title: "Программа под тебя", desc: "Сериалы, работа, экзамен, переезд — собираю курс вокруг твоей реальной цели, а не учебника.", order: 1 },
      { n: "03", title: "Без скучных учебников", desc: "Мемы, песни, статьи, подкасты. Живой язык вместо «London is the capital».", order: 2 },
      { n: "04", title: "Видно прогресс", desc: "Личный журнал, отметки и материалы в кабинете. Ты всегда знаешь, куда движешься.", order: 3 },
    ],
  });

  // ── LessonTypes ──
  await prisma.lessonType.deleteMany();
  await prisma.lessonType.createMany({
    data: [
      { tag: "Дети 7–14", title: "Игровой английский", desc: "Через игры, истории и движение. Без зубрёжки и слёз над тетрадью.", dur: "45 мин", who: "индивидуально / мини-группа", order: 0 },
      { tag: "Подростки", title: "Школа · ОГЭ · ЕГЭ", desc: "Подтягиваем оценки и готовим к экзаменам так, чтобы было не страшно.", dur: "60 мин", who: "индивидуально", order: 1 },
      { tag: "Взрослые", title: "Разговорный клуб", desc: "Снимаем языковой барьер. Говорим о реальном — путешествия, работа, жизнь.", dur: "60 мин", who: "индивидуально / пары", order: 2 },
      { tag: "Карьера", title: "Английский для работы", desc: "Собеседования, письма, созвоны, презентации. Английский, который двигает карьеру.", dur: "60 мин", who: "индивидуально", order: 3 },
    ],
  });

  // ── Packages ──
  await prisma.package.deleteMany();
  await prisma.package.createMany({
    data: [
      { name: "Проба пера", price: "0 ₽", priceAmount: 0, per: "пробное", popular: false, accent: false, feats: J(["Знакомство 40 минут", "Определяем уровень", "План по твоей цели"]), cta: "Записаться бесплатно", note: "Это бесплатно. Серьёзно.", isTrial: true, order: 0 },
      { name: "Разогрев", price: "6 400 ₽", priceAmount: 6400, per: "4 занятия / мес", popular: false, accent: false, feats: J(["1 занятие в неделю", "Материалы в кабинете", "Домашка с проверкой"]), cta: "Выбрать пакет", note: "1 600 ₽ / занятие", order: 1 },
      { name: "В потоке", price: "11 200 ₽", priceAmount: 11200, per: "8 занятий / мес", popular: true, accent: true, feats: J(["2 занятия в неделю", "Личный журнал прогресса", "Чат с преподавателем 24/7", "Доступ к библиотеке"]), cta: "Выбрать пакет", note: "1 400 ₽ / занятие · −12%", order: 2 },
      { name: "Интенсив", price: "19 800 ₽", priceAmount: 19800, per: "16 занятий / мес", popular: false, accent: false, feats: J(["4 занятия в неделю", "Всё из «В потоке»", "Разбор речи на видео", "Цель за 2 месяца"]), cta: "Выбрать пакет", note: "1 238 ₽ / занятие · −23%", order: 3 },
    ],
  });

  // ── Promos ──
  await prisma.promo.deleteMany();
  await prisma.promo.createMany({
    data: [
      { big: "−20%", title: "Приведи друга", desc: "Скидка вам обоим на следующий месяц.", order: 0 },
      { big: "−15%", title: "Оплата за 3 месяца", desc: "Платишь курсом — платишь меньше.", order: 1 },
      { big: "0 ₽", title: "Первое занятие", desc: "Пробное всегда бесплатно. Без карты и условий.", order: 2 },
    ],
  });

  // ── Team ──
  await prisma.teamMember.deleteMany();
  await prisma.teamMember.createMany({
    data: [
      { name: "Павел", role: "Английский · основатель", tags: J(["Разговорный", "ЕГЭ", "Бизнес"]), note: "«Учитель года» 4×. Сам и есть тот самый человек со стен этого сайта.", photoUrl: "/uploads/pavel.jpg", hero: true, order: 0 },
      { name: "Мария", role: "Английский для детей", tags: J(["Дети", "Игровой формат"]), note: "Превращает урок в приключение. Дети просят «ещё одно занятие».", hero: false, order: 1 },
      { name: "Денис", role: "Подготовка к экзаменам", tags: J(["IELTS", "TOEFL", "ОГЭ"]), note: "Знает каждую ловушку экзамена в лицо. Средний балл учеников — 7.5+.", hero: false, order: 2 },
      { name: "Аня", role: "Разговорная практика", tags: J(["Speaking", "Произношение"]), note: "Ставит произношение и снимает барьер. С ней не страшно ошибаться.", hero: false, order: 3 },
    ],
  });

  // ── Reviews ──
  await prisma.review.deleteMany();
  await prisma.review.createMany({
    data: [
      { name: "Ольга К.", who: "мама ученика, 9 лет", stars: 5, text: "Сын впервые сам сел за английский. Раньше — слёзы, теперь спрашивает, когда занятие. Это магия какая-то.", order: 0 },
      { name: "Артём", who: "backend-разработчик", stars: 5, text: "За полгода с Павлом прошёл два собеседования на английском и получил оффер в международную команду. Барьера будто и не было.", order: 1 },
      { name: "Светлана", who: "готовилась к переезду", stars: 5, text: "Боялась говорить вообще. Сейчас спокойно болтаю с соседями в Лиссабоне. Спасибо, что не давили, а вытаскивали.", order: 2 },
      { name: "Дмитрий", who: "ЕГЭ, 96 баллов", stars: 5, text: "Готовились без паники и зубрёжки. На экзамене было ощущение, что я это уже сто раз делал. 96 баллов.", order: 3 },
      { name: "Ника", who: "разговорный клуб", stars: 5, text: "Единственные занятия, которые я ни разу не захотела пропустить. Смешно, по-человечески и реально работает.", order: 4 },
    ],
  });

  // ── FAQ ──
  await prisma.faq.deleteMany();
  await prisma.faq.createMany({
    data: [
      { q: "Английский правда заговорит, или это просто слоган?", a: "Заговорит. Речь идёт с первого занятия — мы не ждём «идеального момента». Барьер уходит за счёт практики, а не теории.", order: 0 },
      { q: "Сколько занятий нужно до результата?", a: "Зависит от цели. Снять барьер — 1–2 месяца. Подготовка к экзамену — 4–6. На пробном я честно скажу, сколько понадобится именно вам.", order: 1 },
      { q: "Как проходят занятия — онлайн или очно?", a: "И так, и так. Большинство учеников занимаются онлайн из любой точки мира. Очно — по договорённости.", order: 2 },
      { q: "Что если придётся пропустить занятие?", a: "Предупредите за 12 часов — перенесём без потерь. Всё видно в личном кабинете, там же напоминания.", order: 3 },
      { q: "А пробное точно бесплатное?", a: "Абсолютно. Без карты, без «первый месяц со скидкой». 40 минут, чтобы понять, ваш ли это формат.", order: 4 },
      { q: "Вы работаете с полными нулями?", a: "Да, и очень люблю это. С нуля даже проще — нет страха «я всё забыл» и старых ошибок.", order: 5 },
    ],
  });

  // ── Materials (бесплатные) ──
  await prisma.material.deleteMany();
  await prisma.material.createMany({
    data: [
      { tag: "PDF", title: "Шпаргалка по временам", desc: "Все времена на одной странице. Без боли.", size: "1.2 МБ", order: 0 },
      { tag: "Подкаст", title: "100 фраз для разговора", desc: "Аудио, чтобы слушать в дороге.", size: "18 мин", order: 1 },
      { tag: "Видео", title: "Произношение: th, w, r", desc: "Разбор звуков, которые ломают всех.", size: "12 мин", order: 2 },
      { tag: "Notion", title: "Трекер слов", desc: "Шаблон, чтобы слова не утекали.", size: "шаблон", order: 3 },
    ],
  });

  // ── Legal ──
  for (const doc of [
    {
      key: "privacy",
      title: "Политика конфиденциальности",
      order: 0,
      body: J([
        "Мы собираем минимум данных — только то, что нужно для записи на занятие и связи с вами: имя, контакт (Telegram / email / телефон) и ваши учебные цели.",
        "Данные используются исключительно для организации занятий, напоминаний и обратной связи. Мы не передаём их третьим лицам и не используем для рекламы.",
        "Вы можете в любой момент запросить удаление своих данных, написав на hello@pavelenglish.ru — мы удалим всё в течение 3 рабочих дней.",
        "Платёжные данные обрабатываются на стороне платёжного провайдера и не сохраняются на нашей стороне.",
      ]),
    },
    {
      key: "consent",
      title: "Согласие на обработку данных",
      order: 1,
      body: J([
        "Оставляя заявку на сайте, вы даёте согласие на обработку персональных данных в соответствии с ФЗ-152 «О персональных данных».",
        "Согласие даётся на сбор, хранение и использование указанных вами данных с целью оказания образовательных услуг.",
        "Согласие действует до момента отзыва. Отозвать его можно письменным обращением на контактный email.",
      ]),
    },
    {
      key: "reqs",
      title: "Реквизиты и оферта",
      order: 2,
      body: J([
        "ИП Петров Павел Петрович",
        "ИНН: 000000000000 · ОГРНИП: 000000000000000",
        "Расчётный счёт: 0000 0000 0000 0000 0000",
        "Банк: АО «Банк» · БИК: 000000000",
        "Email для документов: hello@pavelenglish.ru",
        "Полный текст публичной оферты предоставляется по запросу до оплаты.",
      ]),
    },
  ]) {
    await prisma.legalDoc.upsert({
      where: { key: doc.key },
      update: { title: doc.title, body: doc.body, order: doc.order },
      create: doc,
    });
  }

  // ── Admin ──
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@pavelenglish.ru";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin12345";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin" },
    create: {
      email: adminEmail,
      name: "Администратор",
      role: "admin",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  // ── Демо-ученик Анна ──
  const anna = await prisma.user.upsert({
    where: { email: "anna@example.com" },
    update: { packageName: "В потоке" },
    create: {
      email: "anna@example.com",
      phone: "+7 900 000-00-00",
      name: "Анна",
      role: "student",
      packageName: "В потоке",
      passwordHash: await bcrypt.hash("demo12345", 10),
    },
  });

  await prisma.lesson.deleteMany({ where: { userId: anna.id } });
  await prisma.lesson.createMany({
    data: [
      { userId: anna.id, dateLabel: "Сегодня", time: "19:00", topic: "Past Simple vs Present Perfect", status: "soon", order: 0 },
      { userId: anna.id, dateLabel: "Чт, 5 июня", time: "19:00", topic: "Small talk: погода, выходные, планы", status: "plan", order: 1 },
      { userId: anna.id, dateLabel: "Пн, 9 июня", time: "19:00", topic: "Phrasal verbs: get / take / put", status: "plan", order: 2 },
    ],
  });

  await prisma.journalEntry.deleteMany({ where: { userId: anna.id } });
  await prisma.journalEntry.createMany({
    data: [
      { userId: anna.id, date: "30 мая", topic: "Conditionals (0–2)", mark: "A−", note: "Отлично с 1st conditional. Подтянуть «would» в гипотезах.", order: 0 },
      { userId: anna.id, date: "26 мая", topic: "Travel vocabulary", mark: "B+", note: "Сильный словарь. Поработать над артиклями.", order: 1 },
      { userId: anna.id, date: "23 мая", topic: "Speaking: my weekend", mark: "A", note: "Говорила свободно, почти без пауз. Так держать!", order: 2 },
    ],
  });

  await prisma.studentMaterial.deleteMany({ where: { userId: anna.id } });
  await prisma.studentMaterial.createMany({
    data: [
      { userId: anna.id, tag: "PDF", title: "Personal: твои слова недели", size: "6 стр.", order: 0 },
      { userId: anna.id, tag: "Аудио", title: "Запись разбора Present Perfect", size: "14 мин", order: 1 },
      { userId: anna.id, tag: "Doc", title: "Домашка к занятию 04.06", size: "задание", order: 2 },
    ],
  });

  await prisma.payment.deleteMany({ where: { userId: anna.id } });
  await prisma.payment.createMany({
    data: [
      { userId: anna.id, packageName: "В потоке", period: "Май", amount: 11200, status: "paid", paidAt: new Date("2026-05-01") },
      { userId: anna.id, packageName: "В потоке", period: "Апрель", amount: 11200, status: "paid", paidAt: new Date("2026-04-01") },
      { userId: anna.id, packageName: "Разогрев", period: "Март", amount: 6400, status: "paid", paidAt: new Date("2026-03-01") },
    ],
  });

  // ── Слоты онлайн-записи (детерминированно, как в прототипе) ──
  const days = [
    { d: "Пн", n: "2" },
    { d: "Вт", n: "3" },
    { d: "Ср", n: "4" },
    { d: "Чт", n: "5" },
    { d: "Пт", n: "6" },
    { d: "Сб", n: "7" },
  ];
  const times = ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30", "19:00", "20:30"];
  await prisma.scheduleSlot.deleteMany();
  for (let di = 0; di < days.length; di++) {
    for (let si = 0; si < times.length; si++) {
      const seed = (di * 7 + si * 3) % 10;
      // seed<3 → booked (без ученика). Иначе свободно. (mine — определяется бронью.)
      const status = seed < 3 ? "booked" : "free";
      await prisma.scheduleSlot.create({
        data: {
          dayLabel: days[di].d,
          dateLabel: `${days[di].n}.06`,
          weekOrder: di,
          time: times[si],
          status,
        },
      });
    }
  }

  console.log("✓ Сид завершён");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
