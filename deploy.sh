#!/bin/bash
set -e

# Путь, куда клонируется проект
PROJECT_DIR="/home/frontend/bear-cud.ru"

echo "🚀 Начало деплоя для $PROJECT_DIR..."

# Проверка существования директории
if [ ! -d "$PROJECT_DIR" ]; then
  echo "❌ Директория $PROJECT_DIR не найдена! Создайте её или смените путь в скрипте."
  exit 1
fi

cd "$PROJECT_DIR"

echo "🔄 Обновление кода из Git..."
if [ -d .git ]; then
  git pull origin release || true
else
  echo "⚠️ Git репозиторий не инициализирован в папке."
fi

echo "📦 Пересборка и запуск контейнеров..."
# Используем --remove-orphans, чтобы убрать старые контейнеры, если имена поменялись
docker compose down --remove-orphans
docker compose up -d --build

echo "✅ Деплой успешно завершён!"
docker ps | grep two-leptos