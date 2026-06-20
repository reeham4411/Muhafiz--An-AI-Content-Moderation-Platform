FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---- Production image ----
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Uploads directory needs to exist and be writable at runtime
RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["node", "dist/server.js"]
