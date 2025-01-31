import { NextRequest } from "next/server";
import { middleware as mw } from '@ararog/microblog-next'

export async function middleware(req:NextRequest) {
  return mw(req);
}

// specify the path regex to apply the middleware to
export const config = {
  matcher: '/api/:path*',
}