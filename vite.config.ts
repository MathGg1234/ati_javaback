import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        server: {
            proxy: {
                // Redirige /backend/* vers l'IP du backend
                [env.VITE_URL_BACKEND]: {
                    target: env.VITE_BACKEND_TARGET,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(new RegExp(`^${env.VITE_URL_BACKEND}`), ''),
                },
                // Redirige /gh/* vers l'IP de GraphHopper
                [env.VITE_GRAPHHOPPER_URL]: {
                    target: env.VITE_GRAPHHOPPER_TARGET,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(new RegExp(`^${env.VITE_GRAPHHOPPER_URL}`), ''),
                },
            },
        },
    }
})
