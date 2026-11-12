import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`. Requires Vite 8, which ships this option.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Non-testable code: the bootstrap file is excluded here,
      // blog.module.ts is excluded in-file with `v8 ignore file`.
      exclude: ['src/main.ts', 'src/**/*.spec.ts'],
      reporter: ['text', 'html'],
    },
  },
});
