import { SignupFormSchema } from "@ararog/microblog-validation";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { generatePassword } from "@/helpers/password";
import { prisma } from "@/helpers/prisma";
import { generateToken } from "@/helpers/token";
import sendMail from "@/services/mail";

export async function POST(req: NextRequest) {

  const signupPayload = await req.json();

  try {
    SignupFormSchema.parse(signupPayload);
  }
  catch(e) {
    if (e instanceof ZodError) {
      return new NextResponse(JSON.stringify({ errors: e.formErrors.fieldErrors }), {
        status: 400,
      });  
    }
  }

  const {salt, hash } = generatePassword(signupPayload.password);

  await prisma.user.create({
    data: {
      email: signupPayload.email,
      salt,
      hash,
    }
  });

  const token = generateToken(8);

  const content = {title: "E-mail Verification", message: "Please enter the following code to verify your e-mail:", token};

  await sendMail(signupPayload.email, "E-mail Verification", content, "/app/templates/email-verify.html");

  return new NextResponse(null, {
    status: 200,
  });  
};