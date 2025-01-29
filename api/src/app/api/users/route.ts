import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/helpers/prisma";
import { Role } from "@/enums/role";

export async function GET(req: NextRequest) {

  const role = req.headers.get("role");

  if(!role) {
    return new NextResponse(JSON.stringify({ errors: { user: ["Invalid role"] } }), {
      status: 400,
    });
  }

  if(role && role !== Role.ADMIN) {
    return new NextResponse(JSON.stringify({ errors: { user: ["Access Denied"] } }), {
      status: 403,
    });
  }

  try {
    const users = await prisma.user.findMany();

    return new NextResponse(JSON.stringify(users), {
      status: 200,
    });  
  } catch {
    return new NextResponse(JSON.stringify({ errors: { server: ["Internal Server Error"] } }), {
      status: 500,
    });
  }
}