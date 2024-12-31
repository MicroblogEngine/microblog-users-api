import NextAuth from "next-auth"
import Sendgrid from "next-auth/providers/sendgrid"
import { prisma } from "@/helpers/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Sendgrid({
    from: "no-reply@microblog.training",
  })],
})