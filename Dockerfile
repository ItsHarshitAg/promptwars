FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps --ignore-scripts
COPY . .
RUN npm run build

FROM node:22-alpine
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts express dotenv @google/genai dompurify jsdom firebase && npm cache clean --force
COPY server.js .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD ["node", "server.js"]
