import "dotenv/config";
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { authRouter } from "./auth.js";
import { githubRouter } from "./routes/github.js";
import { imagesRouter } from "./routes/images.js";

const app = express();
const port = process.env.PORT ?? 3001;

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
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", authRouter);
app.use("/api/github", githubRouter);
app.use("/api/images", imagesRouter);

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
