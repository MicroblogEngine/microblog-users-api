import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ararog/microblog-users-api-db";
import { ErrorMessages, logger, Topics } from "@ararog/microblog-server";
import { ForgotPasswordFormSchema } from "@ararog/microblog-validation";

import { sendMessageToKafka } from "@/helpers/kafka";

const log = logger.child({
  route: "forgotPassword"
});

export const POST = async (req: NextRequest) => {
  const forgotPasswordPayload = await req.json();

  
  const {success, data, error} =  ForgotPasswordFormSchema.safeParse(forgotPasswordPayload);
  if (!success) {
    log.warn("Invalid forgot password payload");
    return new NextResponse(JSON.stringify({ errors: error?.formErrors.fieldErrors }), {
      status: 400,
    });  
  }

  const user = await prisma.user.findFirst({
    where: {
      email: data.email
    }
  });

  if (!user) {
    log.warn("User not found");
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.notFound] } }), {
      status: 404,
    });
  }

  await sendMessageToKafka(Topics.SEND_RESET_PASSWORD_MAIL, user);
  
  return new NextResponse(null, {
    status: 200,
  });
}