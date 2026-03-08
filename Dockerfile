# ---- Stage 1 : Build ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---- Stage 2 : Runtime ----
FROM node:22-alpine AS runner

# Principle of least privilege: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/v1/health || exit 1

CMD ["node", "dist/index.js"]
