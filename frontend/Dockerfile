# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Собираем production версию
RUN npm run build

# Финальный образ с Nginx
FROM nginx:alpine

# Копируем собранные файлы Vite (из папки dist)
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем ваш конфигурационный файл
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]