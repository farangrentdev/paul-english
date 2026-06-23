#!/usr/bin/env bash
# Pavel English — деплой одной командой (для запуска под root на чистом VPS).
# Идемпотентен: можно запускать повторно (новый код / новые параметры).
#
#   bash <(curl -fsSL https://raw.githubusercontent.com/farangrentdev/paul-english/main/deploy/install.sh)
#
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/farangrentdev/paul-english.git}"
APP_DIR="${APP_DIR:-/opt/pavel-english}"
DOMAIN="${DOMAIN:-paul-english.ru}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-admin@pavelenglish.ru}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@pavelenglish.ru}"

say() { printf "\n\033[1;33m==> %s\033[0m\n" "$*"; }

# ── 1. Базовая подготовка ОС ──────────────────────────────────────────────────
say "Базовая подготовка ОС"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg lsb-release git rsync htop nano sqlite3 \
  ufw fail2ban unattended-upgrades tzdata

timedatectl set-timezone Europe/Moscow || true

# Swap, если RAM < 3 ГБ
if [ ! -f /swapfile ] && [ "$(awk '/MemTotal/ {print $2}' /proc/meminfo)" -lt 3000000 ]; then
  say "Создаю swap 2 ГБ"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ── 2. Docker ────────────────────────────────────────────────────────────────
if ! command -v docker >/dev/null; then
  say "Установка Docker engine + compose"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  CODENAME=$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $CODENAME stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

# ── 3. Firewall (открыты 22/80/443) ──────────────────────────────────────────
say "UFW"
ufw allow 22/tcp >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

# fail2ban для sshd (ВАЖНО: исключаем нашего админа от случайного бана)
say "fail2ban для sshd"
cat >/etc/fail2ban/jail.d/sshd.local <<'EOF'
[sshd]
enabled = true
bantime = 1h
maxretry = 8
ignoreip = 127.0.0.1/8 ::1
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

# ── 4. Код проекта ───────────────────────────────────────────────────────────
say "Получение кода в $APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  cd "$APP_DIR"
  git fetch --all
  git reset --hard origin/main
fi

cd "$APP_DIR"

# ── 5. .env (генерируем секреты один раз) ────────────────────────────────────
ENV_FILE="$APP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  say "Генерирую .env (AUTH_SECRET, пароль админа)"
  AUTH_SECRET="$(openssl rand -base64 32 | tr -d '\n')"
  ADMIN_PASS="$(openssl rand -base64 12 | tr -d '/=+\n' | cut -c1-14)"

  cat > "$ENV_FILE" <<EOF
DATABASE_URL=file:/data/app.db
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
APP_URL=https://$DOMAIN
DOMAIN=$DOMAIN
LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
SEED_ADMIN_EMAIL=$ADMIN_EMAIL
SEED_ADMIN_PASSWORD=$ADMIN_PASS
EOF
  chmod 600 "$ENV_FILE"
  echo "Пароль админа сгенерирован и записан в $ENV_FILE"
else
  say ".env уже существует — оставляем как есть"
fi

# ── 6. Запуск Docker Compose ─────────────────────────────────────────────────
say "docker compose up -d --build (миграции применяются автоматически в CMD)"
docker compose -f "$APP_DIR/docker-compose.yml" --env-file "$ENV_FILE" up -d --build

# Ждём готовности app
say "Жду пока приложение поднимется (до 90 сек)"
for i in $(seq 1 18); do
  if curl -fsS http://127.0.0.1/ -H "Host: localhost" >/dev/null 2>&1 \
     || docker compose -f "$APP_DIR/docker-compose.yml" exec -T app curl -fsS http://127.0.0.1:3000/ >/dev/null 2>&1; then
    echo "app готов"
    break
  fi
  sleep 5
done

# ── 7. Сид (только при первом запуске) ───────────────────────────────────────
SEED_MARKER="/var/lib/pavel-english.seeded"
if [ ! -f "$SEED_MARKER" ]; then
  say "Первичный сид БД"
  docker compose -f "$APP_DIR/docker-compose.yml" exec -T app npm run db:seed
  touch "$SEED_MARKER"
fi

# ── 8. Backup-cron ───────────────────────────────────────────────────────────
say "Бэкап-скрипт + cron (раз в сутки в 04:15)"
install -m 0755 "$APP_DIR/deploy/backup.sh" /usr/local/bin/pavel-backup.sh
cat >/etc/cron.d/pavel-backup <<'EOF'
15 4 * * * root /usr/local/bin/pavel-backup.sh >> /var/log/pavel-backup.log 2>&1
EOF

# ── 9. Итоги ─────────────────────────────────────────────────────────────────
ADMIN_PASS=$(grep '^SEED_ADMIN_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)
IP=$(curl -fsS -4 https://api.ipify.org 2>/dev/null || echo "<IP>")

say "Готово!"
cat <<EOF

   ┌─────────────────────────────────────────────────────────────┐
   │  Pavel English поднялся на $IP                              │
   │                                                             │
   │  По IP (HTTP):   http://$IP/                                │
   │  По домену:      https://$DOMAIN/  (после A-записи DNS)     │
   │                                                             │
   │  Админка:        /admin/login                               │
   │   email:         $ADMIN_EMAIL                               │
   │   password:      $ADMIN_PASS                                │
   │                                                             │
   │  Полезное:                                                  │
   │   logs:          docker compose -f $APP_DIR/docker-compose.yml logs -f
   │   restart:       docker compose -f $APP_DIR/docker-compose.yml restart app
   │   update:        cd $APP_DIR && git pull && docker compose up -d --build
   └─────────────────────────────────────────────────────────────┘

EOF
