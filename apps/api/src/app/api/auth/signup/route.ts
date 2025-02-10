import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ararog/microblog-users-api-db";
import { SignupFormSchema } from "@ararog/microblog-validation";
import { ErrorMessages, Topics } from "@ararog/microblog-server";

import { generatePassword } from "@/helpers/password";
import { createProfile } from "@/services/profile";
//import { generateJWT } from "@/helpers/jwt";
import { sendMessageToKafka } from "@/helpers/kafka";

export async function POST(req: NextRequest) {
  const signupPayload = await req.json();

  const {success, data, error} = SignupFormSchema.safeParse(signupPayload);
  if (!success) {
    return new NextResponse(JSON.stringify({ errors: error?.formErrors.fieldErrors }), {
      status: 400,
    });  
  }

  const {salt, hash } = generatePassword(data.password);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (globalThis as any).roles.user;

  if (!role) {
    console.error(ErrorMessages.role.notFound);
    return new NextResponse(JSON.stringify({ errors: { role: [ErrorMessages.role.notFound] } }), {
      status: 404,
    });
  }

  let user = await prisma.user.findFirst({
    where: {
      username: data.username
    }
  });

  if (user) {
    console.error(ErrorMessages.user.usernameAlreadyExists);
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.usernameAlreadyExists] } }), {
      status: 409,
    });
  }

  user = await prisma.user.findFirst({
    where: {
      username: data.email
    }
  });

  if (user) {
    console.error(ErrorMessages.user.emailAlreadyExists);
    return new NextResponse(JSON.stringify({ errors: { user: [ErrorMessages.user.emailAlreadyExists] } }), {
      status: 409,
    });
  }

  user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      salt,
      hash,
      roleId: role!.id
    }
  });

  if (!user) {
    console.error(ErrorMessages.user.couldNotCreate);
    return new NextResponse(JSON.stringify({ errors: { generic: [ErrorMessages.generic.internalServerError] } }), {
      status: 500,
    });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error(ErrorMessages.secret.notFound);
    return new NextResponse(JSON.stringify({ errors: { generic: [ErrorMessages.generic.internalServerError] } }), {
      status: 500,
    });
  }

  //const jwtToken = await generateJWT({ id: user.id, role: role.name }, secret);

  const profileCreated = await createProfile(user.id, {
    name: data.name,
    birthDate: data.birthDate.toISOString()
  });

  if (!profileCreated) {
    console.error(ErrorMessages.profile.couldNotCreate);
    return new NextResponse(JSON.stringify({ errors: {generic: [ErrorMessages.generic.internalServerError] } }), {
      status: 500,
    });  
  }    

  await sendMessageToKafka(Topics.SEND_VERIFICATION_MAIL, user);

  return new NextResponse(JSON.stringify({ id: user.id }), {
    status: 200,
  });  
}