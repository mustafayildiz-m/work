# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build NestJS application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install wget and curl for health checks
RUN apk add --no-cache wget curl cairo pango jpeg giflib librsvg font-noto

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Copy source code for migrations (TypeORM needs TypeScript files for migrations)
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.build.json ./tsconfig.build.json

# Create uploads directory
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && chown nestjs:nodejs /app/docker-entrypoint.sh

# Install netcat for MySQL connection check
RUN apk add --no-cache netcat-openbsd

# Switch to non-root user
USER nestjs

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]

