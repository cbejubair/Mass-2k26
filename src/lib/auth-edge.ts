/**
 * Edge-compatible JWT verification using `jose`.
 *
 * The default `jsonwebtoken` package relies on Node.js `crypto` APIs
 * which are NOT available in the Edge Runtime that Next.js middleware uses.
 * `jose` implements JWT using the standard Web Crypto API, so it works
 * in both Edge and Node.js runtimes.
 *
 * This module is imported ONLY by middleware.ts.
 * API routes and server components continue to use `@/lib/auth` (jsonwebtoken).
 */
import { jwtVerify } from "jose";
import type { UserRole } from "@/lib/types";

export interface JWTPayload {
  userId: string;
  role: UserRole;
  registerNumber: string | null;
  name: string;
  department: string | null;
  year: string | null;
  classSection: string | null;
}

// Encode the secret once — TextEncoder works in Edge Runtime
const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyTokenEdge(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
