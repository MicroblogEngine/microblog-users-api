import { User } from "@prisma/client";

export type LoginResponse = {
  user: Partial<User> & { id: string, username: string, email: string, emailVerified: Date | null },
  token: string
}
