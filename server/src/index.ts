import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./auth.js";

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

app.listen(port, () => {
  console.log(`mrama-admin-server listening on port ${port}`);
});
