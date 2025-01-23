import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { ForgotPasswordFormSchema } from "@ararog/microblog-validation";
import { prisma } from "@/helpers/prisma";
import sendMail from "@/services/mail";
import { generateToken } from "@/helpers/token";

export const POST = async (req: NextRequest) => {
  const forgotPasswordPayload = await req.json();

  try {
    ForgotPasswordFormSchema.parse(forgotPasswordPayload);
  }
  catch(e) {
    if (e instanceof ZodError) {
      return new NextResponse(JSON.stringify({ errors: e.formErrors.fieldErrors }), {
        status: 400,
      });  
    }
  }

  const user = await prisma.user.findFirst({
    where: {
      email: forgotPasswordPayload.email
    }
  });

  if (!user) {
    return new NextResponse(JSON.stringify({ errors: { email: ["User not found"] } }), {
      status: 404,
    });
  }

  const token = generateToken(8);

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/password/reset?token=${token}&email=${user.email}`;

  const content = {title: "Reset your password", message: "Click link below to reset your password", url};

  await sendMail(user.email, "Reset your password", content, "/app/templates/forgot-password.html");
  
  return new NextResponse(null, {
    status: 200,
  });
}