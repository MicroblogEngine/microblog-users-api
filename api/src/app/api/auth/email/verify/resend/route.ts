import { NextRequest, NextResponse } from "next/server";
import { ErrorMessages } from "@ararog/microblog-server";
import { logger } from "@/helpers/pino";

import { sendVerificationMail } from "@/services/mail";
import { prisma } from "@/helpers/prisma";

const log = logger.child({
  route: "resendEmailVerification"
});

export const POST = async (req: NextRequest) => {
  const { userId } = await req.json();

  if (!userId) {
    log.warn("Invalid user id");
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.invalidId] } }), {
      status: 400,
    });
  }

  const user = await prisma.user.findFirst({ 
    where: {
      id: userId
    }
  });

  if (!user) {
    log.warn("User not found");
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.notFound] } }), {
      status: 404,
    });
  }

  await sendVerificationMail(user);

  return new NextResponse(null, {
    status: 200,
  });
}