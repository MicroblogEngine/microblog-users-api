import { User } from "@prisma/client";

export type LoginResponse = {
  user: Partial<User>,
  token: string
}
