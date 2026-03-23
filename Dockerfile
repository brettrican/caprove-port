FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache curl bash iproute2
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/built ./built
COPY public ./public
COPY template ./template
COPY dockerfiles ./dockerfiles
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:3000/health || exit 1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=768 --max-http-header-size=16384"
ENV NODE_CLUSTER_WORKERS=2
ENV MAX_PARALLEL_UPLOADS=5
EXPOSE 3000
CMD ["node", "./built/server.js"]
