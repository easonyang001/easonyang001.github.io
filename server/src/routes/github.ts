import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { listOpenPulls } from "../github.js";

export const githubRouter = Router();
githubRouter.use(requireAuth);

githubRouter.get("/pulls", async (_req, res) => {
  try {
    const pulls = await listOpenPulls();
    res.json(pulls);
  } catch (err) {
    console.error("GitHub pulls list failed:", err);
    res.status(502).json({ error: "Failed to list pull requests" });
  }
});
