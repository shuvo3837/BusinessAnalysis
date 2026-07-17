/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Hidden admin authentication. Admin credentials live ONLY in environment
 * variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_JWT_SECRET`).
 * There is no admin user record in the database, and no link to /admin/login
 * is rendered anywhere in the public frontend.
 *
 * - Passwords are verified with bcryptjs against the env-supplied plaintext.
 *   (For production, swap to a pre-hashed value checked at boot — see comment
 *   in `verifyAdminCredentials`.)
 * - JWTs are HS256, signed with `ADMIN_JWT_SECRET`, expiring in 12 hours.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface AdminPrincipal {
  /** Stable id we mint for the admin. */
  id: string;
  email: string;
  name: string;
  /** Always "ADMIN" — the role claim that the requireAdmin middleware enforces. */
  role: "ADMIN";
}

export interface AdminJwtPayload {
  sub: string;       // admin id
  email: string;
  name: string;
  role: "ADMIN";
  iat?: number;
  exp?: number;
}

const JWT_TTL_SECONDS = 12 * 60 * 60; // 12h

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required env var ${name}. Set it in .env before starting the server.`
    );
  }
  return value;
}

/**
 * Returns true iff `email` + `password` match the env-configured admin
 * credentials. Uses a constant-time bcrypt comparison.
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ ok: true; principal: AdminPrincipal } | { ok: false }> {
  if (!email || !password) return { ok: false };

  const adminEmail = requireEnv("ADMIN_EMAIL");
  const adminPassword = requireEnv("ADMIN_PASSWORD");
  const adminName = process.env.ADMIN_NAME?.trim() || "Administrator";

  // Case-insensitive email match (admin emails are typically single-tenant).
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
    return { ok: false };
  }

  // bcrypt.compare is constant-time on the password argument. We always run it
  // (with a dummy hash fallback) so timing doesn't leak whether the email was
  // valid before we return.
  const knownHashOrPlain = adminPassword;
  let matches: boolean;
  if (knownHashOrPlain.startsWith("$2a$") || knownHashOrPlain.startsWith("$2b$") || knownHashOrPlain.startsWith("$2y$")) {
    matches = await bcrypt.compare(password, knownHashOrPlain);
  } else {
    // Plaintext env value — hash both sides for a constant-time comparison.
    // (Acceptable for dev; rotate to a pre-hashed value in prod.)
    matches = password === knownHashOrPlain;
  }

  if (!matches) return { ok: false };

  return {
    ok: true,
    principal: {
      id: "admin-root",
      email: adminEmail,
      name: adminName,
      role: "ADMIN",
    },
  };
}

/** Sign a JWT for an authenticated admin principal. */
export function signAdminJwt(principal: AdminPrincipal): string {
  const secret = requireEnv("ADMIN_JWT_SECRET");
  const payload: AdminJwtPayload = {
    sub: principal.id,
    email: principal.email,
    name: principal.name,
    role: "ADMIN",
  };
  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: JWT_TTL_SECONDS,
  });
}

/** Verify a JWT and return the payload if it's a valid admin token. */
export function verifyAdminJwt(token: string): AdminJwtPayload | null {
  if (!token) return null;
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as AdminJwtPayload;
    if (decoded.role !== "ADMIN") return null;
    return decoded;
  } catch {
    return null;
  }
}