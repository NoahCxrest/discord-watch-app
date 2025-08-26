# ---- Base image ----

# ---- Base image for dependencies ----
FROM oven/bun:1.1.13 as bun-base
WORKDIR /app

# ---- Install dependencies with Bun ----
FROM bun-base as deps
COPY bun.lockb package.json ./
RUN bun install --frozen-lockfile

# ---- Build with Node.js ----
FROM node:20-alpine as build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY . .
RUN npm run build

# ---- Production runner ----
FROM oven/bun:1.1.13 as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app .
EXPOSE 3000
CMD ["bun", "run", "start"]
