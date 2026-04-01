# Run and deploy bear-cud

Репозиторий содержит два изолированных проекта: `frontend/` для React/Vite-приложения и `backend/` для Express + Prisma API. Для Git это всё ещё один репозиторий, но каждое приложение живёт в своей собственной директории с собственным `package.json`, `tsconfig.json` и набором зависимостей.

## Структура

- `frontend/` содержит React-приложение на Vite и Tailwind. В режиме разработки оно проксирует запросы на `/api` к бекенду.
- `backend/` содержит Express-сервер, Prisma и PostgreSQL-подсистему. В режиме `NODE_ENV=production` он отдаёт собранный фронтенд из `../frontend/dist`.
- `Dockerfile` и `docker-compose.yaml` собирают фронтенд-часть (и могут работать вместе с API-контейнером, если потребуется).

## Запуск локально

### Backend
1. `cd backend`
2. `npm install`
3. Скопируйте `.env.example` в `.env`, заполните `DATABASE_URL` строкой PostgreSQL (`postgresql://user:password@host:5432/db`) и, при необходимости, `PORT`.
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. При необходимости обновите `VITE_API_HOST` в `.env` (по умолчанию `https://api.bear-cud.ru`, в деве — `http://localhost:4000`). Переменная используется в прокси `/api`.
4. `npm run dev`

Фронтенд запустится на `http://localhost:3000`, а бекенд на `http://localhost:4000`. Вызовы из браузера к `/api/*` автоматически проксируются на API.

## Сборка и продакшен

1. В `frontend` выполните `npm run build` — собранные файлы попадут в `frontend/dist`.
2. В `backend` выполните `npm run build`, а после `NODE_ENV=production npm run start`. В этом режиме сервер отдаёт статику из `../frontend/dist` и обслуживает API.
3. Для синхронизации схемы используйте Prisma (см. раздел ниже).

## Docker и деплой

- `Dockerfile` билдит `frontend` и копирует `dist` в nginx-контейнер, а `nginx.conf` уже настроен на SPA.
- `docker-compose.yaml` можно развить, чтобы отдельно запускать контейнер с API (например, добавив сервис из `backend`).
- `deploy.sh` выполняет `docker compose up --build`, поэтому перед деплоем убедитесь, что `frontend` собирается независимо.
- `docker compose up -d --build --no-deps frontend` отдельно сборка фронтенда 
- `docker compose up -d --build --no-deps backend` отдельно сборка бэкенда 
- `docker compose up -d --build db` отдельно сборка базы 

## Prisma

Схема лежит в `backend/prisma/schema.prisma` и работает с PostgreSQL через `DATABASE_URL`. Процесс разработки:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init         # создаст миграцию и применит её
```

Для быстрых подтяжек схемы (без генерации миграции) можно использовать `npx prisma db push`, но он не записывает историю изменений.

## Бэкап PostgreSQL

Перед запуском `npx prisma migrate dev` сделайте дамп базы:

```bash
# внутри PostgreSQL-контейнера
docker exec -it <postgres-container> pg_dump -U <pg_user> -d <db_name> > /tmp/bear-cud-backup.sql

# с хоста против контейнера
PGPASSWORD=<pg_password> pg_dump -h localhost -p 5432 -U <pg_user> <db_name> > backup.sql
```

Сохраняйте дамп в безопасном месте и проверяйте, что файл создаётся до изменений.

## Telegram Mini App

1. Мини-приложение отправляет `init_data` в `/api/auth/telegram-init`.
2. Сервер валидирует подпись через `TELEGRAM_BOT_TOKEN`.
3. Если такой Telegram ID уже привязан к пользователю, ответ содержит токен и `user`, и вход происходит автоматически.
4. Если пользователя нет, сервер возвращает `telegramData`, и фронт просит ввести логин/пароль.
5. Первая авторизация через Telegram требует логин+пароль, чтобы связать `telegramId`, `first_name` и `last_name` с аккаунтом. В дальнейшем можно заходить только по `init_data`.