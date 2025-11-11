import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Bonded - Social Network for College Students',
        short_name: 'Bonded',
        description: 'Find friends, roommates, and connections at your university',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/functions\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-functions-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 5 // 5 minutes - short cache for API calls
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 3 // Fall back to cache if network is slow
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(jpg|jpeg|png|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: false, // Disable CSS code splitting to ensure all CSS is in one file
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
          // UI libraries - group Radix UI together
          'radix-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          // Large chart library
          'charts-vendor': ['recharts'],
          // Icons library
          'icons-vendor': ['lucide-react'],
          // Form libraries
          'form-vendor': ['react-hook-form', 'react-day-picker'],
          // Other UI utilities
          'ui-vendor': [
            'sonner',
            'vaul',
            'cmdk',
            'embla-carousel-react',
            'react-resizable-panels',
            'input-otp',
            'next-themes',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});