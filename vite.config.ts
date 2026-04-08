import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['td5-logo.svg', 'td5-logo-192x192.png', 'td5-logo-512x512.png'],
      manifest: {
        name: 'TD5 - Daily Todo Tracker',
        short_name: 'TD5',
        description: 'Track your top 5 daily todos',
        theme_color: '#849669',
        background_color: '#0f0f0f',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'td5-logo-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'td5-logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'td5-logo-512x512.png',
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
