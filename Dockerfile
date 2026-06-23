# ── Pavel English — production-образ (Next.js + Prisma + SQLite) ──
# SQLite требует постоянного диска: примонтируйте volume и укажите
# DATABASE_URL=file:/data/app.db (см. README).

FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production
WORKDIR /app

# ── deps ──
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
# postinstall выполнит prisma generate
RUN npm ci

# ── build ──
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── runner ──
FROM base AS runner
ENV PORT=3000
# для seed нужен tsx (devDependency) — оставляем node_modules целиком
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts

EXPOSE 3000
# применяем миграции и запускаем сервер
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
