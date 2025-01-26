import { NextRequest, NextResponse } from "next/server";
import { ErrorMessages } from "@ararog/microblog-server";

import { sendVerificationMail } from "@/services/mail";
import { prisma } from "@/helpers/prisma";

export const POST = async (req: NextRequest) => {
  const { userId } = await req.json();

  if (!userId) {
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.invalidId] } }), {
      status: 400,
    });
  }

  const user = await prisma.user.findFirst({ 
    where: {
      id: userId
    }
  });

  if (!user) {
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.notFound] } }), {
      status: 404,
    });
  }

  await sendVerificationMail(user);

  return new NextResponse(null, {
    status: 200,
  });
}