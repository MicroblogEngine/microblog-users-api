import { ResetPasswordFormSchema } from "@ararog/microblog-validation";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/helpers/prisma";
import { generatePassword } from "@/helpers/password";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;

  const token = params.get("token");
  const email = params.get("email");

  if(!token || !email) {
    return new NextResponse(null, {
      status: 400,
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      email
    }
  });

  if (!user) {
    return new NextResponse(JSON.stringify({ errors: { email: ["User not found"] } }), {
      status: 404,
    });
  }

  const verification_token = await prisma.verificationToken.findFirst({
    where: {
      userId: user.id,
      token
    }
  });

  if(!verification_token) {
    return new NextResponse(JSON.stringify({ errors: { email: ["Invalid token"] } }), {
      status: 401,
    });
  }

  if (verification_token.expires && verification_token.expires < new Date()) {
    return new NextResponse(JSON.stringify({ errors: { email: ["Token expired"] } }), {
      status: 401,
    });
  }  

  return new NextResponse(null, {
    status: 200,
  });
}

export const POST = async (req: NextRequest) => {
  const resetPasswordPayload = await req.json();

  try {
    ResetPasswordFormSchema.parse(resetPasswordPayload);
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
      email: resetPasswordPayload.email
    }
  });

  if (!user) {
    return new NextResponse(JSON.stringify({ errors: { email: ["User not found"] } }), {
      status: 404,
    });
  }

  const {salt, hash } = generatePassword(resetPasswordPayload.password);

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