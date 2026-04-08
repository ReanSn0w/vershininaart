FROM klakegg/hugo:ext-alpine AS builder

# рабочая директория внутри контейнера
WORKDIR /src

# копируем весь проект (включая content, layouts, themes и т.д.)
COPY . .

# аргументы (опционально) для управления сборкой
ARG HUGO_ENV=production
ARG HUGO_BASEURL=/

ENV HUGO_ENV=${HUGO_ENV}
ENV HUGO_BASEURL=${HUGO_BASEURL}

# запускаем сборку; результат будет в /src/public
RUN hugo --minify

# Stage 2: nginx serves the generated static files
FROM nginx:alpine

# (необязательно) удалить дефолтный контент nginx
RUN rm -rf /usr/share/nginx/html/*

# копируем сгенерированную статическую файловую систему из builder
COPY --from=builder /src/public /usr/share/nginx/html

# (опционально) копируем кастомный конфиг nginx, если он есть в проекте
# например, если у вас есть nginx/default.conf в корне проекта:
# COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# по умолчанию nginx уже запускается корректной CMD в базовом образе
