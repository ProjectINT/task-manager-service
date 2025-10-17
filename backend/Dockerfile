# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

WORKDIR /workspace

ENV CI="true" \
    npm_config_update_notifier="false" \
    npm_config_audit="false" \
    DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Copy monorepo root package files
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Install dependencies for backend workspace
RUN npm install --workspace=backend

# Copy shared validation module
COPY validation ./validation

# Copy backend source
COPY backend ./backend

# Generate Prisma client
WORKDIR /workspace/backend
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
