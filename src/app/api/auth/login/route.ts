import { validPassword } from "@/helpers/password";
import { prisma } from "@/helpers/prisma";
import { LoginResponse } from "@/models/users";
import { LoginFormSchema } from "@ararog/microblog-validation";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {

  const credentialsPayload = await req.json();

  try {
    LoginFormSchema.parse(credentialsPayload);
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
      username: credentialsPayload.username 
    }
  });

  const secret = process.env.AUTH_SECRET;
  if (!user || !secret) {
    return new NextResponse(null, {
      status: 401,
    });  
  }

  const isValidPassword = validPassword(credentialsPayload.password, 
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
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
    },
    token
  };

  return new NextResponse(JSON.stringify(response), {
      status: 200,
  });  
}