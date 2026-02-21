# =========================
# 1️⃣ Builder Stage
# =========================
FROM oven/bun:1.1.30-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# =========================
# 2️⃣ Runtime Stage
# =========================
FROM caddy:2.8-alpine

WORKDIR /srv

COPY --from=builder /app/dist /srv

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]