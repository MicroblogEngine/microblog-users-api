import { NextRequest, NextResponse } from "next/server";
import { ErrorMessages, Topics } from "@ararog/microblog-server";
import { prisma } from "@ararog/microblog-users-api-db";

import { sendMessageToKafka } from "@/helpers/kafka";

export const POST = async (req: NextRequest) => {
  const { userId } = await req.json();

  if (!userId) {
    console.warn("Invalid user id");
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
    console.warn("User not found");
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.notFound] } }), {
      status: 404,
    });
  }

  await sendMessageToKafka(Topics.SEND_VERIFICATION_MAIL, user);

  return new NextResponse(null, {
    status: 200,
  });
}