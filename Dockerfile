# syntax=docker/dockerfile:1
ARG NODE_VERSION=23-bookworm
ARG DEBIAN_CODENAME=slim
ARG SOURCE_DIR=/home/jenkins

FROM node:${NODE_VERSION}-${DEBIAN_CODENAME} AS base

FROM base AS builder
ARG SOURCE_DIR
WORKDIR "$SOURCE_DIR"

RUN corepack enable && \
  apt-get update -y && \
  apt-get install -y openssl
RUN yarn global add turbo

# Use the approach here to build faster
# https://turbo.build/repo/docs/guides/tools/docker

COPY . .
# We need install dev dependencies for turbo build without NODE_ENV=production
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch && \
  pnpm install

# Set the environment to production only for build
ENV NODE_ENV=production
RUN pnpm turbo build

FROM base AS test
ARG SOURCE_DIR
WORKDIR "$SOURCE_DIR"
#RUN pnpm run test
RUN echo "do nothing"


FROM base AS runtime

ARG SOURCE_DIR
WORKDIR "$SOURCE_DIR"
ENV NODE_ENV=production

RUN apt-get update -y && \
  apt-get install -y openssl && \
  addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache

RUN mkdir -p api worker-kafka worker-grpc && \
  chown nextjs:nodejs api worker-kafka worker-grpc

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/apps/api/public", "./api/public"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/apps/api/.next/standalone", "./api"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/apps/api/.next/static", "./api/.next/static"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/packages/database/generated/client", "./api/apps/api/generated/client"]

COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/packages/database/generated/client", "./generated/client"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/apps/worker-kafka/dist", "./worker-kafka"]
COPY --from=builder --chown=nextjs:nodejs ["${SOURCE_DIR}/apps/worker-grpc/dist", "./worker-grpc"]

CMD ["node ${SCRIPT_PATH}"]
