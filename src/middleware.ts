import { NextRequest } from "next/server";
import { corsMiddleware } from "@/middlewares/cors.middleware";

export function middleware(req:NextRequest) {
  return corsMiddleware(req);
}

// specify the path regex to apply the middleware to
export const config = {
  matcher: '/api/:path*',
}