import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@/enums': path.resolve(__dirname, './src/app/enums'),
      '@/helpers': path.resolve(__dirname, './src/app/helpers'),
      '@/services': path.resolve(__dirname, './src/app/services')
    },
  },
})