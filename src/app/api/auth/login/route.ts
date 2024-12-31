import { validPassword } from "@/helpers/password";
import { prisma } from "@/helpers/prisma";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const cred = await req.json();

    const user = await prisma.user.findFirst({ 
      where: {
        email: cred.email 
      }
    });

    const secret = process.env.AUTH_SECRET;
    if (user && secret) {
      const isValidPassword = validPassword(cred.password, 
        user.hash, user.salt);
        
      if(isValidPassword) {
        const token = await new jose.SignJWT({ id: user.id })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('2w')
          .sign(new TextEncoder().encode(secret))        
    
        return new NextResponse(JSON.stringify({token}), {
            status: 200,
        });  
      }
    }
    else {
      return new NextResponse(null, {
        status: 401,
      });  
    }
}