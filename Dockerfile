# syntax=docker/dockerfile:1
ARG NODE_VERSION=23-bookworm
ARG DEBIAN_CODENAME=slim
ARG SOURCE_DIR=/home/jenkins

FROM node:${NODE_VERSION}-${DEBIAN_CODENAME} AS base

FROM base AS builder
ARG SOURCE_DIR
WORKDIR "$SOURCE_DIR"
ENV NODE_ENV=production
RUN corepack enable && \
  apt-get update -y && \
  apt-get install -y openssl
RUN yarn global add turbo
COPY . .
RUN turbo prune api worker-kafka worker-grpc --docker


FROM base AS installer
ARG SOURCE_DIR
WORKDIR "$SOURCE_DIR"
COPY --from=builder out/json/ .
RUN pnpm install 
COPY --from=builder out/full/ .
RUN pnpm turbo build


FROM builder AS test
ARG SOURCE_DIR
WORKDIR "$SOURCE_DIR"
RUN pnpm run lint


FROM base AS runtime

ARG SOURCE_DIR
WORKDIR "$SOURCE_DIR"
ENV NODE_ENV=production

RUN apt-get update -y && \
  apt-get install -y openssl && \
  addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

COPY --from=builder ["${SOURCE_DIR}/apps/api/public", "./api/public"]
# Set the correct permission for prerender cache

RUN mkdir api/.next worker-kafka/dist worker-grpc/dist && \
  chown nextjs:nodejs api/.next worker-kafka/dist worker-grpc/dist

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/apps/api/.next/standalone", "./api"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/apps/api/.next/static", "./api/.next/static"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/apps/worker-kafka/dist", "./worker-kafka"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/apps/worker-grpc/dist", "./worker-grpc"]

CMD ["node", "./api/server.js"]

