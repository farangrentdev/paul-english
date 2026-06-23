// Конфиг сущностей для универсальной админки.

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "list" // textarea: одна строка = элемент массива (JSON)
  | "pairs" // textarea: "Подпись | url" построчно (JSON [{label,url}])
  | "image"; // загрузка файла → url

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  optional?: boolean;
};

export type Entity = {
  key: string; // сегмент урла
  model: string; // имя Prisma-делегата
  title: string; // заголовок раздела
  singular: string; // для кнопок («Добавить отзыв»)
  fields: Field[];
  listColumns: { name: string; label: string }[];
};

const orderField: Field = { name: "order", label: "Порядок", type: "number", help: "Чем меньше — тем выше" };

export const ENTITIES: Record<string, Entity> = {
  team: {
    key: "team",
    model: "teamMember",
    title: "Педагоги",
    singular: "педагога",
    listColumns: [
      { name: "name", label: "Имя" },
      { name: "role", label: "Роль" },
      { name: "hero", label: "Основатель" },
    ],
    fields: [
      { name: "name", label: "Имя", type: "text" },
      { name: "role", label: "Роль / специализация", type: "text" },
      { name: "tags", label: "Теги", type: "list", help: "По одному в строке" },
      { name: "note", label: "Описание", type: "textarea" },
      { name: "photoUrl", label: "Фото", type: "image", optional: true },
      { name: "hero", label: "Это основатель (большая карточка)", type: "checkbox" },
      orderField,
    ],
  },
  packages: {
    key: "packages",
    model: "package",
    title: "Пакеты",
    singular: "пакет",
    listColumns: [
      { name: "name", label: "Название" },
      { name: "price", label: "Цена" },
      { name: "popular", label: "Хит" },
    ],
    fields: [
      { name: "name", label: "Название", type: "text" },
      { name: "price", label: "Цена (текст, напр. «11 200 ₽»)", type: "text" },
      { name: "priceAmount", label: "Сумma для оплаты, ₽ (0 = бесплатно)", type: "number" },
      { name: "per", label: "Период (напр. «8 занятий / мес»)", type: "text" },
      { name: "feats", label: "Что входит", type: "list", help: "По одному пункту в строке" },
      { name: "cta", label: "Текст кнопки", type: "text" },
      { name: "note", label: "Примечание", type: "text" },
      { name: "popular", label: "Бейдж «хит ⭐»", type: "checkbox" },
      { name: "accent", label: "Выделенная карточка", type: "checkbox" },
      { name: "isTrial", label: "Пробное (кнопка ведёт на запись)", type: "checkbox" },
      orderField,
    ],
  },
  promos: {
    key: "promos",
    model: "promo",
    title: "Акции",
    singular: "акцию",
    listColumns: [
      { name: "big", label: "Скидка" },
      { name: "title", label: "Название" },
    ],
    fields: [
      { name: "big", label: "Крупный текст (напр. «−20%»)", type: "text" },
      { name: "title", label: "Название", type: "text" },
      { name: "desc", label: "Описание", type: "text" },
      orderField,
    ],
  },
  benefits: {
    key: "benefits",
    model: "benefit",
    title: "Преимущества",
    singular: "преимущество",
    listColumns: [
      { name: "n", label: "№" },
      { name: "title", label: "Заголовок" },
    ],
    fields: [
      { name: "n", label: "Номер (напр. «01»)", type: "text" },
      { name: "title", label: "Заголовок", type: "text" },
      { name: "desc", label: "Описание", type: "textarea" },
      orderField,
    ],
  },
  lessons: {
    key: "lessons",
    model: "lessonType",
    title: "Виды занятий",
    singular: "вид занятий",
    listColumns: [
      { name: "tag", label: "Категория" },
      { name: "title", label: "Название" },
    ],
    fields: [
      { name: "tag", label: "Категория (напр. «Взрослые»)", type: "text" },
      { name: "title", label: "Название", type: "text" },
      { name: "desc", label: "Описание", type: "textarea" },
      { name: "dur", label: "Длительность (напр. «60 мин»)", type: "text" },
      { name: "who", label: "Формат (напр. «индивидуально»)", type: "text" },
      orderField,
    ],
  },
  reviews: {
    key: "reviews",
    model: "review",
    title: "Отзывы",
    singular: "отзыв",
    listColumns: [
      { name: "name", label: "Имя" },
      { name: "stars", label: "★" },
      { name: "published", label: "Опубликован" },
    ],
    fields: [
      { name: "name", label: "Имя", type: "text" },
      { name: "who", label: "Кто (напр. «мама ученика»)", type: "text" },
      { name: "stars", label: "Звёзды (1–5)", type: "number" },
      { name: "text", label: "Текст отзыва", type: "textarea" },
      { name: "published", label: "Опубликован", type: "checkbox" },
      orderField,
    ],
  },
  faq: {
    key: "faq",
    model: "faq",
    title: "Частые вопросы",
    singular: "вопрос",
    listColumns: [{ name: "q", label: "Вопрос" }],
    fields: [
      { name: "q", label: "Вопрос", type: "text" },
      { name: "a", label: "Ответ", type: "textarea" },
      orderField,
    ],
  },
  materials: {
    key: "materials",
    model: "material",
    title: "Бесплатные материалы",
    singular: "материал",
    listColumns: [
      { name: "tag", label: "Тип" },
      { name: "title", label: "Название" },
      { name: "published", label: "Опубликован" },
    ],
    fields: [
      { name: "tag", label: "Тип (PDF, Видео…)", type: "text" },
      { name: "title", label: "Название", type: "text" },
      { name: "desc", label: "Описание", type: "textarea" },
      { name: "size", label: "Размер / длительность", type: "text" },
      { name: "fileUrl", label: "Ссылка на файл", type: "text", optional: true },
      { name: "published", label: "Опубликован", type: "checkbox" },
      orderField,
    ],
  },
  legal: {
    key: "legal",
    model: "legalDoc",
    title: "Правовые документы",
    singular: "документ",
    listColumns: [
      { name: "key", label: "Ключ" },
      { name: "title", label: "Заголовок" },
    ],
    fields: [
      { name: "key", label: "Ключ (privacy / consent / reqs)", type: "text" },
      { name: "title", label: "Заголовок", type: "text" },
      { name: "body", label: "Текст (абзацы)", type: "list", help: "Каждый абзац — с новой строки" },
      orderField,
    ],
  },
};

export function getEntity(key: string): Entity | null {
  return ENTITIES[key] ?? null;
}

// Поля singleton-настроек сайта (модель SiteSettings, id=1).
export const SETTINGS_FIELDS: Field[] = [
  { name: "teacherName", label: "Имя преподавателя", type: "text" },
  { name: "teacherRole", label: "Роль / подпись", type: "text" },
  { name: "tagline", label: "Слоган (заголовок hero)", type: "text" },
  { name: "awards", label: "Регалии (hero)", type: "list", help: "По одной в строке" },
  { name: "heroPhotoUrl", label: "Фото (hero / about)", type: "image", optional: true },
  { name: "aboutLead", label: "«Обо мне» — лид", type: "textarea" },
  { name: "aboutBody", label: "«Обо мне» — абзацы", type: "list", help: "Каждый абзац с новой строки" },
  { name: "reviewsScore", label: "Рейтинг (напр. «4.9»)", type: "text" },
  { name: "reviewsCount", label: "Подпись к рейтингу", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Телефон", type: "text" },
  { name: "telegram", label: "Telegram (@username)", type: "text" },
  { name: "socials", label: "Соцсети", type: "pairs", help: "По строке: «Подпись | https://...»" },
  { name: "footerLegal", label: "Строка в подвале", type: "text" },
];
