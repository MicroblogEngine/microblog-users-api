import { validPassword } from "@/helpers/password";
import { prisma } from "@/helpers/prisma";
import { LoginResponse } from "@/models/users";
import { LoginFormSchema } from "@ararog/microblog-validation";
import { User } from "@prisma/client";
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
    include: {
      role: true,
    },
    where: {
      username: credentialsPayload.username 
    }
  });

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return new NextResponse(JSON.stringify({ errors: { secret: ["Secret not found"] } }), {
      status: 500,
    });
  }

  if (!user) {
    return new NextResponse(JSON.stringify({ errors: { user: ["User not found"] } }), {
      status: 404,
    });  
  }

  const isValidPassword = validPassword(credentialsPayload.password, 
    user.hash, user.salt);
    
  if(!isValidPassword) {
    return new NextResponse(JSON.stringify({ errors: { token: ["Invalid password"] } }), {
      status: 401,
    });  
  }

  const token = await new jose.SignJWT({ id: user.id, role: user.role?.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2w')
    .sign(new TextEncoder().encode(secret))        

  const partialUser: Partial<User> = {
    id: user.id,
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
  };

  const response: LoginResponse = {
    user: partialUser,
    token
  };

  return new NextResponse(JSON.stringify(response), {
      status: 200,
  });  
}