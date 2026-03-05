import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["unit/**/*.test.js", "integration/**/*.test.js"],
    environment: "happy-dom",
    setupFiles: ["./setup/dom-setup.js"],
    restoreMocks: true,
    clearMocks: true,
  },
});
