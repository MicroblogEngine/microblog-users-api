import { NextRequest, NextResponse } from "next/server";

import sendMail from "@/services/mail";
import { generateToken } from "@/helpers/token";

export const POST = async (req: NextRequest) => {
  const { email } = await req.json();

  const token = generateToken(8);

  const content = {title: "E-mail Verification", message: "Please enter the following code to verify your e-mail:", token};

  await sendMail(email, "E-mail Verification", content, "/app/templates/email-verify.html");

  return new NextResponse(null, {
    status: 200,
  });
}