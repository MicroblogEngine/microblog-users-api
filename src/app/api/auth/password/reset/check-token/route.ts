import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/helpers/prisma";
import { CheckResetPasswordTokenSchema } from "@ararog/microblog-validation";

export const POST = async (req: NextRequest) => {
  const { token, email } = await req.json();

  try {
    CheckResetPasswordTokenSchema.parse({ token, email });
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
      email: email
    }
  });

  const verification_token = await prisma.verificationToken.findFirst({ 
    where: {
      userId: user?.id,
      token: token
    }
  });

  if(!verification_token) {
    return new NextResponse(JSON.stringify({ errors: { email: ["Token not found"] } }), {
      status: 401,
    });
  }

  if (verification_token.expires && verification_token.expires < new Date()) {
    return new NextResponse(JSON.stringify({ errors: { email: ["Token Expired"] } }), {
      status: 401,
    });
  }  

  return new NextResponse(null, {
    status: 200,
  });
}