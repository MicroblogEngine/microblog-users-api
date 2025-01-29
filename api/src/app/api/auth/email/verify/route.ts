import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/helpers/pino";

import { prisma } from "@/helpers/prisma";
import { VerifyPasswordFormSchema } from "@ararog/microblog-validation";
import { ErrorMessages } from "@ararog/microblog-server";

const log = logger.child({
  route: "verifyEmail"
});

export async function POST(req: NextRequest) {

  const verificationPayload = await req.json();

  const {success, data, error} = VerifyPasswordFormSchema.safeParse(verificationPayload);
  if (!success) {
    return new NextResponse(JSON.stringify({ errors: error?.formErrors.fieldErrors }), {
      status: 400,
    });  
  }

  const user = await prisma.user.findFirst({
    where: {
      id: data.userId
    }
  });

  if (!user) {
    log.error(ErrorMessages.user.notFound);
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
    log.error(ErrorMessages.token.invalid);
    return new NextResponse(JSON.stringify({ errors: { token: [ErrorMessages.token.invalid] } }), {
      status: 401,
    });
  }

  if (verification_token.expires && verification_token.expires < new Date()) {
    log.error(ErrorMessages.token.expired);
    return new NextResponse(JSON.stringify({ errors: { token: [ErrorMessages.token.expired] } }), {
      status: 401,
    });
  }

  await prisma.user.update({
    where: {
      id: user.id!
    },
    data: {
      emailVerified: new Date()
    }
  });

  await prisma.verificationToken.delete({
    where: {
      userId: user.id!,
      token: data.token
    }
  });

  return new NextResponse(null, {
    status: 200,
  });
}