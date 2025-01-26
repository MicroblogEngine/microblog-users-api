import { NextRequest, NextResponse } from "next/server";

import { ForgotPasswordFormSchema } from "@ararog/microblog-validation";
import { prisma } from "@/helpers/prisma";
import { sendResetPasswordMail } from "@/services/mail";
import { ErrorMessages } from "@ararog/microblog-server";

export const POST = async (req: NextRequest) => {
  const forgotPasswordPayload = await req.json();

  
  const {success, data, error} =  ForgotPasswordFormSchema.safeParse(forgotPasswordPayload);
  if (!success) {
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
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.notFound] } }), {
      status: 404,
    });
  }

  await sendResetPasswordMail(user.email);
  
  return new NextResponse(null, {
    status: 200,
  });
}