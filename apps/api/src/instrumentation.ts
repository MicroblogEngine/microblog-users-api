import { PrismaClient } from "@ararog/microblog-users-api-db"
import { registerOTel } from '@vercel/otel'
 
export function register() {
  registerOTel('microblog-users-api')
  initDB();
}

async function initDB() {
  const prisma = new PrismaClient();

  const adminRole = await prisma.role.findFirst({
    where: {
      name: 'admin'
    }
  });

  if (!adminRole) {
    await prisma.role.create({
      data: {
      name: 'admin',
      description: 'Administrator'
    }
  });
  }

  const userRole = await prisma.role.findFirst({
    where: {
      name: 'user'
    }
  });

  if (!userRole) {
    await prisma.role.create({
      data: {
        name: 'user',
        description: 'User'
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).roles = {
    admin: adminRole,
    user: userRole
  }
}