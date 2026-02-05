FROM node:22-bookworm-slim AS base

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

WORKDIR /app

FROM base AS development

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev"]
