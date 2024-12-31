import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function authMiddleware(req:NextRequest, res: NextResponse) {

    const authorization = req.headers.get('authorization');
    if(!authorization)
      return new NextResponse(null, { status: 401 });

    // Bearer token
    const token = authorization?.split(" ")[1];
    try{

      let user = jwt.verify(token, process.env.AUTH_SECRET)
      return NextResponse.next();
    }
    catch{
      //return res.status(401)
    }    

    return res;
}