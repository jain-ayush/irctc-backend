FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm ci --include=dev

COPY . .
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate \
    && npm prune --omit=dev

EXPOSE 3001
CMD ["node", "index.js"]
