import { User } from "@prisma/client";
import { Profile } from "@/models/profiles";

export type LoginResponse = {
  user: Partial<User>,
  profile: Profile,
  token: string
}
