import { defineConfig } from 'vite'

export default defineConfig({
  base: '/tinybubble/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
