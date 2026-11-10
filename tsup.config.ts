import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    slugify: 'src/slugify.ts',
    'validators/index': 'src/validators/index.ts',
    'number-to-words': 'src/number-to-words.ts',
    currency: 'src/currency.ts',
    profanity: 'src/profanity.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  cjsInterop: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
});
