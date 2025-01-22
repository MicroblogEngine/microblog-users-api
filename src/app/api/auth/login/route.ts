import { validPassword } from "@/helpers/password";
import { prisma } from "@/helpers/prisma";
import { LoginResponse } from "@/models/users";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  const cred = await req.json();

  const user = await prisma.user.findFirst({ 
    where: {
      username: cred.username 
    }
  });

  const secret = process.env.AUTH_SECRET;
  if (!user || !secret) {
    return new NextResponse(null, {
      status: 401,
    });  
  }

  const isValidPassword = validPassword(cred.password, 
    user.hash, user.salt);
    
  if(!isValidPassword) {
    return new NextResponse(null, {
      status: 401,
    });  
  }

  const token = await new jose.SignJWT({ id: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2w')
    .sign(new TextEncoder().encode(secret))        

  const response: LoginResponse = {
    user: user,
    token
  };

  return new NextResponse(JSON.stringify(response), {
      status: 200,
  });  
}