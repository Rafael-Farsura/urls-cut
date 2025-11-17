FROM node:20.11.0-alpine AS base

WORKDIR /app

# Dependencies stage
FROM base AS dependencies
WORKDIR /app/services/url-service
COPY services/url-service/package*.json ./
RUN npm install --only=production && npm cache clean --force

# Build stage
FROM base AS build
WORKDIR /app/services/url-service
COPY services/url-service/package*.json ./
RUN npm install
COPY services/url-service/tsconfig.json services/url-service/nest-cli.json ./
COPY services/url-service/src ./src
COPY database /app/database
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=dependencies /app/services/url-service/node_modules ./node_modules
COPY --from=build /app/services/url-service/dist ./dist
COPY --from=build /app/services/url-service/package.json ./package.json
COPY --from=build /app/database ./database

EXPOSE 3002

CMD ["node", "dist/main.js"]

