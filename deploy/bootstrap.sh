#!/usr/bin/env bash
# Pavel English — первичная подготовка VPS (Ubuntu 24.04/22.04).
# Запустить под root:    bash deploy/bootstrap.sh
set -euo pipefail

echo "==> apt update + базовые пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg lsb-release ufw fail2ban git rsync unzip \
  htop nano sqlite3 tzdata

echo "==> Часовой пояс"
timedatectl set-timezone Europe/Moscow || true

echo "==> Swap (на случай маленькой RAM)"
if [ ! -f /swapfile ] && [ "$(awk '/MemTotal/ {print $2}' /proc/meminfo)" -lt 3000000 ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Docker engine + compose plugin"
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

echo "==> UFW (открыты 22/80/443)"
ufw --force reset >/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> fail2ban для sshd"
cat >/etc/fail2ban/jail.d/sshd.local <<'EOF'
[sshd]
enabled = true
bantime = 1h
maxretry = 5
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

echo "==> unattended-upgrades"
apt-get install -y unattended-upgrades || true
dpkg-reconfigure -f noninteractive unattended-upgrades || true

echo "==> Готово."
docker --version
docker compose version
ufw status verbose | head
