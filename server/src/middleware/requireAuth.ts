import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export interface AuthedRequest extends Request {
  user?: { sub: string; username: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET) as unknown as { sub: string; username: string };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
