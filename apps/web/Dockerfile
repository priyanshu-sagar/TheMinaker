# ─── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/ui-kit/package.json ./packages/ui-kit/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared-types ./packages/shared-types
COPY packages/ui-kit ./packages/ui-kit
COPY apps/web ./apps/web
COPY tsconfig.base.json ./

# Build shared packages and web
RUN pnpm --filter @minaker/shared-types build || true
RUN pnpm --filter @minaker/ui-kit build || true
RUN pnpm --filter @minaker/web build

# ─── Production stage ─────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy from builder
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=builder /app/packages/ui-kit/package.json ./packages/ui-kit/
COPY --from=builder /app/apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile --prod

# Copy compiled files
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist || true
COPY --from=builder /app/packages/ui-kit/dist ./packages/ui-kit/dist || true
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3001
CMD ["pnpm", "--filter", "@minaker/web", "start"]
