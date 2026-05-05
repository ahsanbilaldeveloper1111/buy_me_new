# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install --ignore-scripts

FROM node:22-alpine AS builder
WORKDIR /app
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm run start"]
