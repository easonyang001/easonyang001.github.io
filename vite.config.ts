import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    allowedHosts: ["localhost", "127.0.0.1"],
  },
  test: {
    environment: "node",
  },
});
