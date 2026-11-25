import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', agent: 'src/agent/index.ts' },
  // Share chunks between the two entries in CJS too, so there is one copy of each component.
  splitting: true,
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: false,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  banner: { js: '"use client";' },
});
