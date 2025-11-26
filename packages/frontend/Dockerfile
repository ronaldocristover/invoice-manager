# Frontend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app/packages/frontend

# Copy package.json and install dependencies directly in frontend
COPY packages/frontend/package.json packages/frontend/package-lock.json* ./
RUN npm ci

# Copy source files and configs
COPY packages/frontend/src ./src
COPY packages/frontend/index.html ./
COPY packages/frontend/vite.config.ts ./
COPY packages/frontend/tsconfig.json ./
COPY packages/frontend/tsconfig.node.json ./
COPY packages/frontend/tailwind.config.js ./
COPY packages/frontend/postcss.config.js ./

# Build frontend (skip type checking for Docker builds - use vite directly)
ENV NODE_ENV=production
RUN npx vite build

# Production stage with nginx
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

