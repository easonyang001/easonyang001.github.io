import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}
const MAX_BEARER_TOKEN_LENGTH = 4096;

export interface AuthedRequest extends Request {
  user?: { sub: string; username: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token || token.length > MAX_BEARER_TOKEN_LENGTH) {
    res.status(401).json({ error: "Missing token" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.sub !== "string" ||
      typeof payload.username !== "string"
    ) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    req.user = { sub: payload.sub, username: payload.username };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
