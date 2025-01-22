import { prisma } from "@/helpers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  const verificationPayload = await req.json();

  const verification_token = await prisma.verificationToken.findFirst({ 
    where: {
      userId: verificationPayload.userId,
      token: verificationPayload.token
    }
  });

  if(!verification_token) {
    return new NextResponse(null, {
      status: 401,
    });
  }

  if (verification_token.expires && verification_token.expires < new Date()) {
    return new NextResponse(null, {
      status: 401,
    });
  }

  return new NextResponse(null, {
    status: 200,
  });
}