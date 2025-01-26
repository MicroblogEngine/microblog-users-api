import { SignJWT } from "jose";

type JWTPayload = {
  id: string;
  role: string;
}

export const generateJWT = async (payload: JWTPayload, secret: string) => {
  const token = await new SignJWT(payload)
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('2w')
  .sign(new TextEncoder().encode(secret))

  return token;
}