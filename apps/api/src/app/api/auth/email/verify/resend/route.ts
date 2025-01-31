import { NextRequest, NextResponse } from "next/server";
import { ErrorMessages, Topics, logger } from "@ararog/microblog-server";
import { prisma } from "@ararog/microblog-users-api-db";

import { sendMessageToKafka } from "@/helpers/kafka";

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

  await sendMessageToKafka(Topics.SEND_VERIFICATION_MAIL, user);

  return new NextResponse(null, {
    status: 200,
  });
}