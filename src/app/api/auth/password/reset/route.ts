import { ResetPasswordFormSchema } from "@ararog/microblog-validation";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/helpers/prisma";
import { generatePassword } from "@/helpers/password";

export const POST = async (req: NextRequest) => {
  const resetPasswordPayload = await req.json();
  
  const {success, error} = ResetPasswordFormSchema.safeParse(resetPasswordPayload);
  if (!success) {
    return new NextResponse(JSON.stringify({ errors: error?.formErrors.fieldErrors }), {
      status: 400,
    });  
  }

  const user = await prisma.user.findFirst({
    where: {
      email: resetPasswordPayload.email
    }
  });

  if (!user) {
    return new NextResponse(JSON.stringify({ errors: { user: ["User not found"] } }), {
      status: 404,
    });
  }

  const verification_token = await prisma.verificationToken.findFirst({
    where: {
      userId: user.id,
      token: resetPasswordPayload.token
    }
  });

  if(!verification_token) {
    return new NextResponse(JSON.stringify({ errors: { token: ["Invalid token"] } }), {
      status: 401,
    });
  }

  if (verification_token.expires && verification_token.expires < new Date()) {
    return new NextResponse(JSON.stringify({ errors: { token: ["Token expired"] } }), {
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