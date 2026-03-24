# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
# Устанавливаем openssl, который нужен для работы Prisma на Alpine Linux
RUN apk add --no-cache openssl
RUN npm install

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN npm run prisma:generate

# Собираем проект
RUN npm run build

# Создаем финальный минимальный образ
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

# Запускаем скомпилированный сервер
CMD ["npm", "run", "start"]