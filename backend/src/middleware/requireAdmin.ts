/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Express middleware that gates a route behind a valid admin JWT.
 *
 * - Reads the bearer token from `Authorization: Bearer <token>` or
 *   `x-admin-token: <token>`.
 * - 401 if the token is missing or invalid.
 * - 403 if the token is valid but the role claim is not "ADMIN".
 *
 * On success, attaches `req.admin` (an `AdminPrincipal`-shaped object) so
 * downstream handlers can read the caller's identity without re-verifying.
 */

import type { Request, Response, NextFunction } from "express";
import { verifyAdminJwt, AdminPrincipal } from "../services/adminAuth";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminPrincipal;
    }
  }
}

function extractToken(req: Request): string | null {
  const auth = req.header("authorization");
  if (auth && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim();
  }
  const headerToken = req.header("x-admin-token");
  if (headerToken && headerToken.length > 0) {
    return headerToken.trim();
  }
  return null;
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Admin authentication required." });
  }

  const payload = verifyAdminJwt(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired admin token." });
  }
  if (payload.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin role required." });
  }

  req.admin = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: "ADMIN",
  };
  next();
}