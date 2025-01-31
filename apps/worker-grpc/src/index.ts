import { Topics, logger } from "@ararog/microblog-server";

const log = logger.child({
  worker: "microblog-user-api-worker-grpc"
});

const startServer = async () => {
  log.info('Starting server');
  //
}

startServer();