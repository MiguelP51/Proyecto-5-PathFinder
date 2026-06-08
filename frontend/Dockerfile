# Etapa 1: build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=optional

COPY . .

RUN npm run build

# Etapa 2: runtime
FROM node:20-slim

WORKDIR /app

# Copiar solo lo necesario y node_modules ya compilado
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Limpiar las dependencias de desarrollo localmente sin descargar nada
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["npx", "next", "start", "-H", "0.0.0.0"]
