import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/helpers/prisma";
import { VerifyPasswordFormSchema } from "@ararog/microblog-validation";

export async function POST(req: NextRequest) {

  const verificationPayload = await req.json();

  try {
    VerifyPasswordFormSchema.parse(verificationPayload);
  }
  catch(e) {
    if (e instanceof ZodError) {
      return new NextResponse(JSON.stringify({ errors: e.formErrors.fieldErrors }), {
        status: 400,
      });  
    }
  }

  const verification_token = await prisma.verificationToken.findFirst({ 
    where: {
      userId: verificationPayload.userId,
      token: verificationPayload.token
    }
  });

  if(!verification_token) {
    return new NextResponse(JSON.stringify({ errors: { token: ["Token not found"] } }), {
      status: 401,
    });
  }

  if (verification_token.expires && verification_token.expires < new Date()) {
    return new NextResponse(JSON.stringify({ errors: { token: ["Token Expired"] } }), {
      status: 401,
    });
  }

  return new NextResponse(null, {
    status: 200,
  });
}