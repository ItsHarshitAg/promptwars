FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g npm@latest --ignore-scripts
COPY package*.json ./
RUN npm install --legacy-peer-deps --ignore-scripts
COPY . .
RUN npm run build

FROM node:22-alpine
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
RUN npm install -g npm@latest --ignore-scripts
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts && npm cache clean --force
COPY server.js .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD ["node", "server.js"]
