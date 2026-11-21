import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Each test file runs in its own child process, so setup.ts can
    // change the current folder without affecting other files.
    pool: "forks",
    setupFiles: ["test/setup.ts"],
  },
});
