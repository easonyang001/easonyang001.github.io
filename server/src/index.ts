import "dotenv/config";
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { authRouter } from "./auth.js";
import { githubRouter } from "./routes/github.js";
import { imagesRouter } from "./routes/images.js";
import { contentRouter } from "./routes/content.js";

const app = express();
const port = process.env.PORT ?? 3001;
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT ?? "1mb";

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});
app.disable("x-powered-by");
app.use(express.json({ limit: JSON_BODY_LIMIT }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", authRouter);
app.use("/api/github", githubRouter);
app.use("/api/images", imagesRouter);
app.use("/api/content", contentRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal error" });
};
app.use(errorHandler);

app.listen(port, () => {
  console.log(`mrama-admin-server listening on port ${port}`);
});
