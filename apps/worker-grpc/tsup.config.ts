import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  //https://github.com/egoist/tsup/issues/619
  noExternal: [ /(.*)/ ],
  splitting: false,
  bundle: true,
  outDir: './dist',
  clean: true,
  env: { IS_SERVER_BUILD: 'true' },
  loader: { '.json': 'copy' },
  minify: true,
  sourcemap: true,
})