FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:18-alpine AS build
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 taska

COPY --from=deps --chown=taska:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=taska:nodejs /app/dist ./dist
COPY --from=build --chown=taska:nodejs /app/prisma ./prisma
COPY --from=build --chown=taska:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=taska:nodejs /app/package.json ./

USER taska
EXPOSE 5000

RUN npx prisma generate
CMD npx prisma migrate deploy && node dist/server.js
