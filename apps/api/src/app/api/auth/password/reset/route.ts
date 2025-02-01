import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ararog/microblog-users-api-db";
import { ErrorMessages } from "@ararog/microblog-server";
import { ResetPasswordFormSchema } from "@ararog/microblog-validation";

import { generatePassword } from "@/helpers/password";

export const POST = async (req: NextRequest) => {
  const resetPasswordPayload = await req.json();
  
  const {success, data, error} = ResetPasswordFormSchema.safeParse(resetPasswordPayload);
  if (!success) {
    console.warn("Invalid reset password payload");
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
    console.warn("User not found");
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.notFound] } }), {
      status: 404,
    });
  }

  const verification_token = await prisma.verificationToken.findFirst({
    where: {
      userId: user.id,
      token: data.token
    }
  });

  if(!verification_token) {
    console.warn("Invalid token");
    return new NextResponse(JSON.stringify({ errors: { token: [ErrorMessages.token.invalid] } }), {
      status: 401,
    });
  }

  if (verification_token.expires && verification_token.expires < new Date()) {
    console.warn("Token expired");
    return new NextResponse(JSON.stringify({ errors: { token: [ErrorMessages.token.expired] } }), {
      status: 401,
    });
  }  

  const {salt, hash} = generatePassword(resetPasswordPayload.password);

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      salt,
      hash
    }
  });

  return new NextResponse(null, {
    status: 200,
  });
}