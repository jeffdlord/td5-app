import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mo-logo.svg', 'mo-logo-192x192.png', 'mo-logo-512x512.png'],
      manifest: {
        name: 'mo - Daily Todo Tracker',
        short_name: 'mo',
        description: 'Track your daily todos',
        theme_color: '#849669',
        background_color: '#0f0f0f',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'mo-logo-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'mo-logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'mo-logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
