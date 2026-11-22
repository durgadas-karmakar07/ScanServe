import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The API only allows CLIENT_ORIGIN (http://localhost:5173). Fail loudly if the port is taken
  // instead of silently moving to 5174, where every request would be blocked by CORS.
  server: { port: 5173, strictPort: true },
});
