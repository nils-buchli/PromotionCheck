import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['jeep-sqlite', 'jeep-sqlite/loader', 'sql.js']
  }
})