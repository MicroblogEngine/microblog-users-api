import { SignupFormSchema } from "@ararog/microblog-validation";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/helpers/pino";

import { generatePassword } from "@/helpers/password";
import { prisma } from "@/helpers/prisma";
import { createProfile } from "@/services/profile";
import { generateJWT } from "@/helpers/jwt";
import { ErrorMessages } from "@ararog/microblog-server";
import { sendVerificationMail } from "@/services/mail";

const log = logger.child({
  route: "signup"
});

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
    log.error(ErrorMessages.role.notFound);
    return new NextResponse(JSON.stringify({ errors: { role: [ErrorMessages.role.notFound] } }), {
      status: 404,
    });
  }

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      salt,
      hash,
      roleId: role!.id
    }
  });

  if (!user) {
    log.error(ErrorMessages.user.couldNotCreate);
    return new NextResponse(JSON.stringify({ errors: { generic: [ErrorMessages.generic.internalServerError] } }), {
      status: 500,
    });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    log.error(ErrorMessages.secret.notFound);
    return new NextResponse(JSON.stringify({ errors: { generic: [ErrorMessages.generic.internalServerError] } }), {
      status: 500,
    });
  }

  const jwtToken = await generateJWT({ id: user.id, role: role.name }, secret);

  const profileCreated = await createProfile({
    name: data.name,
    birthDate: data.birthDate.toISOString(),
  }, jwtToken);

  if (!profileCreated) {
    log.error(ErrorMessages.profile.couldNotCreate);
    return new NextResponse(JSON.stringify({ errors: {generic: [ErrorMessages.generic.internalServerError] } }), {
      status: 500,
    });  
  }    

  await sendVerificationMail(user);

  return new NextResponse(JSON.stringify({ id: user.id }), {
    status: 200,
  });  
}