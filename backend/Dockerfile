# Этап 1: Сборка
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Устанавливаем openssl (для Debian-систем)
RUN apt-get update && apt-get install -y openssl

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходники (теперь `.dockerignore` защитит node_modules)
COPY . .

# Генерируем Prisma Client и собираем проект
RUN npm run prisma:generate
RUN npm run build

# Этап 2: Финальный образ
FROM node:20-bookworm-slim

WORKDIR /app

# openssl нужен и в продакшене
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Включаем режим продакшена
ENV NODE_ENV=production

# Копируем только готовые файлы из первого этапа
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

# Запускаем скомпилированный сервер
CMD ["npm", "run", "start"]