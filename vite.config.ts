import { resolve } from "node:path";
import { defineConfig } from "vite-plus";

const root = import.meta.dirname;

export default defineConfig({
  // Self-references resolve to src, so tests exercise the public root against
  // the source the package will be built from.
  resolve: {
    alias: {
      "@dldc/mappemonde": resolve(root, "src"),
    },
  },

  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.types.ts"],
    },
  },

  fmt: {
    // Prose docs and CI files are kept untouched by the formatter to avoid
    // unrelated churn.
    ignorePatterns: [
      "**/__snapshots__/**",
      "**/*.md",
      ".github/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
    ],
  },

  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      // `any` was the only exclusion in the previous Deno lint config.
      "no-explicit-any": "off",
      // The value-mode key normalization intentionally relies on the default
      // Array.prototype.sort() (string-coercion order); adding a comparator
      // would change the shipped sort semantics.
      "require-array-sort-compare": "off",
    },
  },

  // Library build (tsdown). The entry map mirrors the export map in
  // package.json so the public root has its own emitted module and types.
  pack: {
    entry: {
      index: "src/index.ts",
    },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
  },
});
