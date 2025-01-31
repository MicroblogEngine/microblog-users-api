import { User } from "@ararog/microblog-users-api-db";
import { Profile } from "@/models/profiles";

export type LoginResponse = {
  user: Partial<User>,
  profile: Profile,
  token: string
}
