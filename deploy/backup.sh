#!/usr/bin/env bash
# Pavel English — суточный бэкап SQLite + uploads.
# В cron: 0 4 * * * /usr/local/bin/pavel-backup.sh

set -euo pipefail
DEST="/var/backups/pavel"
KEEP_DAYS=14
mkdir -p "$DEST"
STAMP=$(date +%Y%m%d-%H%M)

CONTAINER="$(docker compose -f /opt/pavel-english/docker-compose.yml ps -q app)"
DB_VOLUME="$(docker inspect "$CONTAINER" --format '{{ range .Mounts }}{{ if eq .Destination "/data" }}{{ .Source }}{{ end }}{{ end }}')"
UP_VOLUME="$(docker inspect "$CONTAINER" --format '{{ range .Mounts }}{{ if eq .Destination "/app/public/uploads" }}{{ .Source }}{{ end }}{{ end }}')"

# SQLite snapshot (онлайн, без остановки приложения)
sqlite3 "$DB_VOLUME/app.db" ".backup '$DEST/db-$STAMP.sqlite'"

# Архив загрузок
tar -C "$UP_VOLUME" -czf "$DEST/uploads-$STAMP.tar.gz" .

# Ротация
find "$DEST" -type f -mtime +$KEEP_DAYS -delete

echo "[$(date +%H:%M:%S)] backup ok: $DEST/db-$STAMP.sqlite + uploads-$STAMP.tar.gz"
