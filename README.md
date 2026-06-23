# Pavel English

Сайт частной школы английского «Pavel English»: публичный лендинг, личный кабинет ученика, онлайн-оплата через **ЮKassa** и **админка** для управления всем контентом и сущностями.

Реализация дизайн-прототипа (Claude Design handoff) на production-стеке.

## Стек

- **Next.js 16** (App Router) + **React 19** + **TypeScript** — единое приложение: сайт, API и админка.
- **SQLite + Prisma** — БД (один файл, требует постоянного диска).
- **Auth.js (NextAuth v5)** — авторизация (роли `admin` / `student`).
- **ЮKassa** — приём платежей (REST API + webhook).
- Дизайн-система перенесена 1:1 из прототипа (`app/styles/*.css`), шрифты Cormorant / Golos Text / Caveat.

## Быстрый старт

```bash
npm install
cp .env.example .env          # заполнить AUTH_SECRET и (опционально) ключи ЮKassa
npx prisma migrate dev        # создать БД и применить миграции
npm run db:seed               # наполнить контентом + создать админа и демо-ученика
npm run dev                   # http://localhost:3000
```

> `AUTH_SECRET` для прода: `openssl rand -base64 32`.

### Учётные записи после сидирования

| Роль   | Логин                              | Пароль       |
| ------ | ---------------------------------- | ------------ |
| Админ  | `admin@pavelenglish.ru` (env)      | `admin12345` (env) |
| Ученик | `anna@example.com`                 | `demo12345`  |

(Email/пароль админа задаются через `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.)

## Структура

```
app/
  (site)/            публичный сайт (лендинг, /schedule, /materials, /legal, /cabinet)
  admin/login        вход в админку (без guard)
  admin/(panel)/     админка (guard по роли admin)
  api/auth, api/payments
components/site, components/admin
lib/                 db, auth, yookassa, content, admin/* (config + actions)
prisma/              schema.prisma, seed.ts, migrations
```

## Маршруты

- **Сайт:** `/`, `/schedule` (онлайн-запись), `/materials`, `/legal`, `/cabinet`.
- **Кабинет** (`/cabinet`): обзор, расписание, журнал, материалы, оплата — реальные данные ученика.
- **Админка** (`/admin`): сводка, заявки, ученики (+ их занятия/журнал/материалы/платежи), платежи, расписание, настройки сайта и CRUD контента (педагоги, пакеты, акции, преимущества, виды занятий, отзывы, FAQ, материалы, правовые документы).

## Оплата (ЮKassa)

1. В `.env` задать `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, `APP_URL`.
2. В ЛК ЮKassa указать webhook: `POST {APP_URL}/api/payments/webhook` (события `payment.succeeded`, `payment.canceled`).
3. Поток: кнопка оплаты → `POST /api/payments/create` создаёт платёж и возвращает `confirmation_url` → редирект на ЮKassa → возврат на `/cabinet?paid=1` → webhook подтверждает статус и активирует пакет.

> **Демо-режим:** если ключи ЮKassa не заданы, оплата эмулируется (платёж сразу помечается оплаченным) — удобно для разработки.

## Скрипты

| Команда             | Назначение                          |
| ------------------- | ----------------------------------- |
| `npm run dev`       | дев-сервер                          |
| `npm run build`     | production-сборка                   |
| `npm run start`     | запуск собранного приложения        |
| `npm run db:migrate`| `prisma migrate dev`                |
| `npm run db:seed`   | наполнение БД                       |
| `npm run db:studio` | Prisma Studio                       |

## Деплой

> ⚠️ **SQLite требует постоянного диска** — деплойте на хост с persistent volume
> (Railway, Render, Fly.io с volume, VPS), **не** на serverless (Vercel/Lambda).

Переменные окружения в проде: `DATABASE_URL` (абсолютный путь на volume, напр.
`file:/data/app.db`), `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `APP_URL`,
`YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`.

### Node-хост

```bash
npm ci
npm run build
npx prisma migrate deploy      # применить миграции к боевой БД
npm run db:seed                # один раз — первичное наполнение
npm run start
```

### Docker

```bash
docker build -t pavel-english .
docker run -d -p 3000:3000 \
  -e DATABASE_URL="file:/data/app.db" \
  -e AUTH_SECRET="<openssl rand -base64 32>" \
  -e AUTH_TRUST_HOST=true \
  -e APP_URL="https://example.com" \
  -e YOOKASSA_SHOP_ID="..." -e YOOKASSA_SECRET_KEY="..." \
  -v pavel_data:/data \
  -v pavel_uploads:/app/public/uploads \
  pavel-english
# первичный сид (один раз):
docker exec -it <container> npm run db:seed
```

Два volume: `/data` — файл SQLite, `/app/public/uploads` — загруженные фото/файлы.

## Заметки по архитектуре

- Списки (регалии, фичи пакетов, теги, цели заявки) хранятся в SQLite как JSON-строки — см. `lib/json.ts`.
- Защита `/admin` и `/cabinet` — серверная (проверка сессии в layout/page), без middleware.
- Артефакты дизайн-инструмента (`tweaks-panel`, `image-slot`) в прод не переносились; значения дизайна зафиксированы (accent `#ffd400`, зерно и doodles включены).
