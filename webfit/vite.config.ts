import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: '/webfit',
    plugins: [react()],
    publicDir: "./public",
    build: {
        outDir: '../docs/webfit',
    },
})
