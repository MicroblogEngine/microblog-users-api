import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/helpers/prisma";
import { VerifyPasswordFormSchema } from "@ararog/microblog-validation";

export async function POST(req: NextRequest) {

  const verificationPayload = await req.json();

  const {success, error } = VerifyPasswordFormSchema.safeParse(verificationPayload);
  if (!success) {
    return new NextResponse(JSON.stringify({ errors: error?.formErrors.fieldErrors }), {
      status: 400,
    });  
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