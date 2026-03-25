#!/bin/bash
# deploy.sh

# Останавливаем скрипт при любой ошибке
set -e

echo "🔄 Получение последних изменений..."
git pull origin main

echo "🏗️ Сборка и запуск Docker-контейнеров..."
# Флаг --build заставляет пересобрать образы, флаг -d запускает их в фоне
docker-compose up -d --build

echo "📦 Применение миграций базы данных Prisma..."
# Выполняем команду обновления схемы внутри работающего бэкенд-контейнера
docker-compose exec backend npx prisma db push

echo "✅ Деплой успешно завершен!"


