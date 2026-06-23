# ── Pavel English — production-образ (Next.js + Prisma + SQLite) ──
# SQLite требует постоянного диска: примонтируйте volume и укажите
# DATABASE_URL=file:/data/app.db (см. README).

# Node 20 LTS — на Node 22 npm виснет в "Exit handler never called!" на
# optional wasm-binding пакетах (@unrs/resolver-binding-wasm32-wasi).
FROM node:20-bookworm-slim AS base
ENV NODE_ENV=production
WORKDIR /app

# ── deps ──
# npm install (не ci) — терпимее к network glitches и lockfile-нюансам.
# Зеркало npmmirror.com стабильно из РФ; зеркало для Prisma engines — тоже.
# --ignore-scripts: postinstall выключен (prisma generate явно ниже).
# --omit=optional: пропускаем wasm-binding оптики, которые не нужны на x86_64.
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install \
      --no-audit --no-fund --no-progress \
      --ignore-scripts \
      --omit=optional \
      --legacy-peer-deps \
      --fetch-timeout=600000 \
      --fetch-retries=5 \
      --fetch-retry-maxtimeout=120000 \
      --registry=https://registry.npmmirror.com/ \
 && PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    npx prisma generate

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
