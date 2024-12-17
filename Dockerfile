# syntax=docker/dockerfile:1
ARG NODE_VERSION=23.4
ARG CODENAME=alpine

ARG SOURCE_DIR=/home/jenkins

FROM node:${NODE_VERSION}-${CODENAME} AS base

FROM base AS builder

ARG SOURCE_DIR

RUN apk add --no-cache libc6-compat
WORKDIR "$SOURCE_DIR"

ENV NODE_ENV production

COPY . .
RUN corepack enable pnpm && \
  pnpm install --no-frozen-lockfile && \
  pnpm run build

FROM builder AS test

ARG SOURCE_DIR

WORKDIR "$SOURCE_DIR"

RUN pnpm run test

FROM base AS runtime

ARG SOURCE_DIR

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder ["${SOURCE_DIR}/public", "./public"]

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="127.0.0.1"

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/.next/standalone", "./"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/.next/static", "./.next/static"]

CMD ["node", "server.js"]

