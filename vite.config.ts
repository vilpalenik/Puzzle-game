import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Tu vymenujeme súbory, ktoré má service worker uložiť do cache
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'favicon.ico'], 
      manifest: {
        name: 'Shape Builder',
        short_name: 'Shape Builder',
        description: 'A minimalist puzzle game challenging your logic and spatial thinking.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Dôležité: povie Androidu, že ikona môže mať pozadie
          }
        ]
      }
    })
  ]
})
