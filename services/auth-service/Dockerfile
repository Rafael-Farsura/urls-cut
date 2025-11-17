FROM node:20.11.0-alpine AS base

WORKDIR /app

# Dependencies stage
FROM base AS dependencies
WORKDIR /app/services/auth-service
COPY services/auth-service/package*.json ./
RUN npm install --only=production && npm cache clean --force

# Build stage
FROM base AS build
WORKDIR /app/services/auth-service
COPY services/auth-service/package*.json ./
RUN npm install
COPY services/auth-service/tsconfig.json services/auth-service/nest-cli.json ./
COPY services/auth-service/src ./src
COPY database /app/database
RUN rm -rf node_modules/.cache tsconfig.tsbuildinfo 2>/dev/null || true
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=dependencies /app/services/auth-service/node_modules ./node_modules
COPY --from=build /app/services/auth-service/dist ./dist
COPY --from=build /app/services/auth-service/package.json ./package.json
COPY --from=build /app/database ./database

EXPOSE 3001

CMD ["node", "dist/main.js"]

