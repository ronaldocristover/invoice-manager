# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install root dependencies
RUN npm ci

# Copy Prisma schema
COPY packages/backend/prisma ./packages/backend/prisma/

# Generate Prisma Client
RUN npm run prisma:generate --workspace=packages/backend

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY packages/backend/package.json ./packages/backend/

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules

# Copy source files
COPY packages/backend/src ./packages/backend/src
COPY packages/backend/tsconfig.json ./packages/backend/
COPY turbo.json ./

# Build backend
RUN npm run build --workspace=packages/backend

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy package.json for production install
COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/package.json ./package.json

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy Prisma files and generated client
COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/dist ./dist

USER nodejs

EXPOSE 5000

ENV PORT=5000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

