import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { findUserByUsername } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

const TOKEN_EXPIRY = "2h";
const MAX_USERNAME_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 1024;
const MAX_BEARER_TOKEN_LENGTH = 4096;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again later." },
});

export const authRouter = Router();

authRouter.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body ?? {};
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length > MAX_USERNAME_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const invalidCredentials = () => res.status(401).json({ error: "Invalid username or password" });

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      // Still run a bcrypt compare against a dummy hash so the response time
      // doesn't reveal whether the username exists.
      await bcrypt.compare(password, "$2a$10$" + "0".repeat(53));
      return invalidCredentials();
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return invalidCredentials();
    }

    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: TOKEN_EXPIRY,
    });
    res.json({ token });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

authRouter.get("/verify", (req, res) => {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token || token.length > MAX_BEARER_TOKEN_LENGTH) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.sub !== "string" ||
      typeof payload.username !== "string"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(200).json({ valid: true });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});
