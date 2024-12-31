import { generatePassword } from "@/helpers/password";
import { prisma } from "@/helpers/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  const newUser = await req.json();

  const {salt, hash } = generatePassword(newUser.password);

  await prisma.user.create({
    data: {
      email: newUser.email,
      salt,
      hash,
    }
  });

  return new NextResponse(null, {
    status: 200,
  });  
};