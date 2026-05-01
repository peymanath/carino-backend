# Stage 1: نصب وابستگی‌ها
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# کپی فایل‌های کلیدی از root monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/

WORKDIR /app/apps/api
RUN pnpm install --ignore-workspace --no-frozen-lockfile

# Stage 2: ساخت اپ
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .
COPY --from=deps /app/apps/api/node_modules apps/api/node_modules

WORKDIR /app/apps/api

COPY apps/api/src/prisma ./src/prisma

RUN pnpm prisma:generate

RUN pnpm build

# Stage 3: تصویر نهایی برای اجرا
FROM node:20-alpine AS runner
WORKDIR /app

# فعال‌سازی PNPM در این مرحله
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# کپی فایل‌ها
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/src/prisma ./src/prisma

ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["sh","-lc","pnpm prisma:deploy && node dist/main.js"]