import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ararog/microblog-users-api-db";
import { ErrorMessages } from "@ararog/microblog-server";
import { VerifyPasswordFormSchema } from "@ararog/microblog-validation";

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
    console.error(ErrorMessages.user.notFound);
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
    console.error(ErrorMessages.token.invalid);
    return new NextResponse(JSON.stringify({ errors: { token: [ErrorMessages.token.invalid] } }), {
      status: 401,
    });
  }

  if (verification_token.expires && verification_token.expires < new Date()) {
    console.error(ErrorMessages.token.expired);
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
      userId_token: {
        userId: user.id!,
        token: data.token
      }
    }
  });

  return new NextResponse(null, {
    status: 200,
  });
}