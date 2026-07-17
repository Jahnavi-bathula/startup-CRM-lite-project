import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Development server configuration
  server: {
    // Force the development server to run on port 5173
    port: 5173,
    // If strictPort is true, Vite will exit with an error instead of 
    // automatically attempting to bind to the next available port
    strictPort: true,
  }
})