import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  //https://github.com/egoist/tsup/issues/619
  noExternal: [ "kafkajs", "handlebars", "@sendgrid", "@ararog" ],
  splitting: true,
  bundle: true,
  target: 'node23',
  outDir: './dist',
  clean: true,
  env: { IS_SERVER_BUILD: 'true' },
  loader: { '.json': 'copy' },
  minify: true,
  format: ['cjs'],
  sourcemap: true,
})