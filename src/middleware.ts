import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from 'jose'

const ignoredRoutes = [
  '/api/users/health',
  '/api/users/metrics',
]

const allowedOrigins = [
  'https://appmicroblogararog.loclx.io', 
  'https://app.microblog.training', 
  'http://microblog-prometheus.default.svc.cluster.local', 
];

export async function middleware(req:NextRequest) {
  const res = NextResponse.next();

  const origin = req.headers.get("origin");
  if (! origin)
    return res;

  // if the origin is an allowed one,
  // add it to the 'Access-Control-Allow-Origin' header
  if (allowedOrigins.includes(origin)) {
    res.headers.append('Access-Control-Allow-Origin', origin);
  }

  // add the remaining CORS headers to the response
  res.headers.append('Access-Control-Allow-Credentials', "true")
  res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
  res.headers.append(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if(! ignoredRoutes.includes(req.url)) {
    const authorization = req.headers.get('authorization');
    if(!authorization)
      return new NextResponse(null, { status: 401 });

    // Bearer token
    const token = authorization?.split(" ")[1];
    try{
      if(process.env.AUTH_SECRET) {
        const { payload: { id }} = await jwtVerify(token, 
          new TextEncoder().encode(process.env.AUTH_SECRET),
          {
            algorithms: ['HS256'],
          });
        if(id) {
          req.headers.append("user", id as string);
        }
        else
          return new NextResponse(null, { status: 401 });
      }
    }
    catch{
      return new NextResponse(null, { status: 401 });
    }    
  }

  return res;
}

// specify the path regex to apply the middleware to
export const config = {
  matcher: '/api/:path*',
}