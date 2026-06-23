# ── Pavel English — production-образ (Next.js + Prisma + SQLite) ──
# SQLite требует постоянного диска: примонтируйте volume и укажите
# DATABASE_URL=file:/data/app.db (см. README).

# Node 20 LTS — на Node 22 npm виснет в "Exit handler never called!" на
# optional wasm-binding пакетах (@unrs/resolver-binding-wasm32-wasi).
FROM node:20-bookworm-slim AS base
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ── deps ──
# npm install (не ci) — терпимее к network glitches и lockfile-нюансам.
# Зеркало npmmirror.com стабильно из РФ; зеркало для Prisma engines — тоже.
# --ignore-scripts: postinstall выключен (prisma generate явно ниже).
# --omit=optional: пропускаем wasm-binding оптики, которые не нужны на x86_64.
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
ARG NPM_FLAGS="--no-audit --no-fund --no-progress --ignore-scripts --legacy-peer-deps --fetch-timeout=600000 --fetch-retries=5 --fetch-retry-maxtimeout=120000 --registry=https://registry.npmmirror.com/"
# 1) Основная установка — без --omit=optional, чтобы платформ-специфичные
#    binary'и (@next/swc-linux-x64-gnu, @swc/core-linux-x64-gnu) ставились
#    из npm-зеркала и Next.js не пытался качать их с Cloudflare во время build.
# 2) Резервная явная установка @next/swc-linux-x64-gnu на случай, если в lockfile
#    он помечен как optional на платформе сборки.
RUN npm install $NPM_FLAGS \
 && npm install @next/swc-linux-x64-gnu@16.2.7 --no-save $NPM_FLAGS \
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
