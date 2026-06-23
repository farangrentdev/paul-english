# ── Pavel English — production-образ (Next.js + Prisma + SQLite) ──
# SQLite требует постоянного диска: примонтируйте volume и укажите
# DATABASE_URL=file:/data/app.db (см. README).

# Node 20 LTS — на Node 22 npm 11 виснет в "Exit handler never called!" на
# optional wasm-binding пакетах (@unrs/resolver-binding-wasm32-wasi).
FROM node:20-bookworm-slim AS base
ENV NODE_ENV=production \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_PROGRESS=false \
    NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_TIMEOUT=600000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_REGISTRY=https://registry.npmmirror.com/ \
    PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
WORKDIR /app

# ── deps ──
# --omit=optional пропускает wasm-binding'и для несвойственных платформ.
# --ignore-scripts отключает postinstall (prisma generate запускаем отдельно).
# Реестр и зеркало для Prisma engines — npmmirror (работает стабильно из РФ).
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts --omit=optional \
 && npx prisma generate

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
