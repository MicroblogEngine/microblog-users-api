import { NextRequest, NextResponse } from "next/server";
import { LoginFormSchema } from "@ararog/microblog-validation";
import { ErrorMessages } from "@ararog/microblog-server";

import { generateJWT } from "@/helpers/jwt";
import { validPassword } from "@/helpers/password";
import { prisma } from "@/helpers/prisma";
import { LoginResponse } from "@/models/users";
import { User } from "@prisma/client";
import { sendVerificationMail } from "@/services/mail";

export async function POST(req: NextRequest) {
  const credentialsPayload = await req.json();

  const {success, data, error} = LoginFormSchema.safeParse(credentialsPayload);
  if (!success) {
    return new NextResponse(JSON.stringify({ errors: error.formErrors.fieldErrors }), {
      status: 400,
    });  
  }

  const user = await prisma.user.findFirst({ 
    include: {
      role: true,
    },
    where: {
      username: data.username
    }
  });

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error(ErrorMessages.secret.notFound);
    return new NextResponse(JSON.stringify({ errors: { secret: [ErrorMessages.generic.internalServerError] } }), {
      status: 500,
    });
  }

  if (!user) {
    console.error(ErrorMessages.user.notFound);
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.invalidUsernameOrPassword] } }), {
      status: 404,
    });  
  }

  if (! user.emailVerified) {
    await sendVerificationMail(user);
    return new NextResponse(JSON.stringify({ 
      errors: { user: [ErrorMessages.user.emailNotVerified] },
      user: {
        id: user.id,
      }
    }), {
      status: 401,
    });  
  }

  const isValidPassword = validPassword(data.password, 
    user.hash, user.salt);
    
  if(!isValidPassword) {
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.invalidUsernameOrPassword] } }), {
      status: 401,
    });  
  }

  const token = await generateJWT({ id: user.id, role: user.role!.name }, secret);

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