# syntax=docker/dockerfile:1
ARG NODE_VERSION=23.4
ARG DEBIAN_CODENAME=slim

ARG SOURCE_DIR=/home/jenkins

FROM node:${NODE_VERSION}-${DEBIAN_CODENAME} AS base

FROM base AS builder

ARG SOURCE_DIR

WORKDIR "$SOURCE_DIR"

ENV NODE_ENV production

RUN corepack enable
COPY . .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --no-frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --no-frozen-lockfile
RUN cd ${SOURCE_DIR} && pnpm run build

FROM builder AS test

ARG SOURCE_DIR

WORKDIR "$SOURCE_DIR"

RUN pnpm run test

FROM base AS runtime
SHELL [ "/bin/bash", "-euo", "pipefail", "-c" ]

ARG SOURCE_DIR

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder ["${SOURCE_DIR}/public", "./public"]

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/.next/standalone", "./"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/.next/static", "./.next/static"]

CMD ["node", "server.js"]

