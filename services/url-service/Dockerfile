FROM node:20.11.0-alpine AS base

WORKDIR /app

# Dependencies stage
FROM base AS dependencies
WORKDIR /app/services/url-service
COPY services/url-service/package*.json ./
RUN npm install --only=production && npm cache clean --force

# Build shared package first
FROM base AS shared-build
WORKDIR /app/packages/shared
COPY packages/shared/package*.json ./
COPY packages/shared/tsconfig.json ./
RUN npm install
COPY packages/shared/src ./src
RUN npm run build
# Keep node_modules for linking during service build

# Build stage
FROM base AS build
WORKDIR /app

# Copy shared package (already built with node_modules and dist)
COPY --from=shared-build /app/packages/shared /app/packages/shared

# Build service
WORKDIR /app/services/url-service
COPY services/url-service/package*.json ./
COPY services/url-service/tsconfig.json services/url-service/nest-cli.json ./
COPY services/url-service/src ./src
COPY database /app/database

# Install dependencies (npm will link to shared package via file:../../packages/shared)
RUN npm install
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

# Copy shared package (dist, package.json, and node_modules) - needed for runtime
COPY --from=shared-build /app/packages/shared ./packages/shared

# Create service directory structure
WORKDIR /app/services/url-service

# Copy service files
COPY --from=build /app/services/url-service/package.json ./package.json
COPY --from=build /app/services/url-service/dist ./dist
COPY --from=build /app/database /app/database

# Install production dependencies (npm will link to shared package via file:../../packages/shared)
RUN npm install --only=production && npm cache clean --force

EXPOSE 3002

CMD ["node", "dist/main.js"]

