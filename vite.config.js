var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: (_a = process.env.API_BASE_URL) !== null && _a !== void 0 ? _a : 'http://127.0.0.1:8787',
                changeOrigin: true,
            },
        },
    },
});
