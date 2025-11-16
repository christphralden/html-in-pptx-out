import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
    external: ['pptxgenjs'],
    tsconfig: './tsconfig.json',
  },
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: false,
    treeshake: true,
    minify: false,
    tsconfig: './tsconfig.json',
  },
]);
