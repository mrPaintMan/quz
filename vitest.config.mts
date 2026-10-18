import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Keep in sync with the exceptions table in docs/engineering.md.
const coverageExceptions = [
  "**/*.test.{ts,tsx}",
  "**/*.setup.ts",
  "**/*.d.ts",
  "convex/_generated/**",
  "convex/schema.ts",
  "convex/**/table.ts",
  "convex/questions/**/*Content.ts",
  "convex/questions/acceptedItem.ts",
  "convex/questions/numberOrNull.ts",
  "src/components/ui/**",
  "src/app/**/layout.tsx",
  "src/app/ConvexClientProvider.tsx",
  "src/app/**/page.tsx",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/": fromRoot("./src/"),
      "@convex/": fromRoot("./convex/"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "convex",
          include: ["convex/**/*.test.ts"],
          environment: "edge-runtime",
          server: { deps: { inline: ["convex-test"] } },
        },
      },
      {
        extends: true,
        test: {
          name: "app",
          include: ["src/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}", "convex/**/*.ts"],
      exclude: coverageExceptions,
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
