import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react-swc";

/// <reference types="vitest" />
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    includeSource: ["src/**/*.{js,ts}"],
  },
});
