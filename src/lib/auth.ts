import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/types";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  userId: string;
  role: UserRole;
  registerNumber: string | null;
  name: string;
  department: string | null;
  year: string | null;
  classSection: string | null;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(
  allowedRoles?: string[],
): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  return session;
}
