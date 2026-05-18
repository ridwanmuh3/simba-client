# syntax=docker/dockerfile:1

FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL=/api
ARG TAG=dev
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV TAG=$TAG

RUN bun run build


FROM caddy:2-alpine

RUN apk add --no-cache wget

COPY --from=builder /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD wget --server-response --spider --max-redirect=0 --header='Host: simbambg.my.id' http://127.0.0.1/ 2>&1 | grep -q ' 308 '
