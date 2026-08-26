# ==========================================
# UTSAVMITRA BACKEND DOCKERFILE
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source and shared types
COPY src/ ./src/
COPY ../shared/ ../shared/

# Build TypeScript to dist
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5050

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY ../shared/ ../shared/

EXPOSE 5050

CMD ["node", "dist/server.js"]
