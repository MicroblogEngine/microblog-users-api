import {createServer, CallContext} from 'nice-grpc';
import { prisma } from "@ararog/microblog-users-api-db";
import {
  DeepPartial, 
  GetUsersRequest,
  GetUsersResponse,
  UsersServiceDefinition, 
  UsersServiceImplementation 
} from '@ararog/microblog-rpc';

const usersServiceImpl: UsersServiceImplementation = {
  async getUsers(
    request: GetUsersRequest,
    context: CallContext
  ): Promise<DeepPartial<GetUsersResponse>> {
    const users = await prisma.user.findMany();
    return { users };
  }
};


const startServer = async () => {
  console.log('Starting server');
  const server = createServer();

  server.add(UsersServiceDefinition, usersServiceImpl);

  console.log('Server listening on ', process.env.GRPC_HOST || '0.0.0.0:8080');
  await server.listen(process.env.GRPC_HOST || '0.0.0.0:8080');
}

startServer();