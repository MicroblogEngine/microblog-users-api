import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/helpers/pino";

import { ForgotPasswordFormSchema } from "@ararog/microblog-validation";
import { prisma } from "@/helpers/prisma";
import { sendResetPasswordMail } from "@/services/mail";
import { ErrorMessages } from "@ararog/microblog-server";

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

  await sendResetPasswordMail(user);
  
  return new NextResponse(null, {
    status: 200,
  });
}