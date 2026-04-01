import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true'
    }),
    react(),
  ],
  build: {
    // Increase chunk warning limit slightly (we're splitting properly now)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime - always needed, cache aggressively
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // UI framework chunks
          'vendor-radix': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
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
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],

          // Animation - heavy but used widely
          'vendor-motion': ['framer-motion'],

          // Icons - large, but stable
          'vendor-icons': ['lucide-react'],

          // Data / query
          'vendor-query': ['@tanstack/react-query'],

          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Charts - only load on pages that need them
          'vendor-charts': ['recharts'],

          // Map - only load on map pages
          'vendor-maps': ['react-leaflet', 'leaflet'],

          // Heavy PDF/canvas tools - lazy loaded via dynamic import ideally
          'vendor-pdf': ['jspdf', 'html2canvas'],

          // Rich text editor
          'vendor-editor': ['react-quill'],

          // 3D - should be dynamically imported but split here as fallback
          'vendor-three': ['three'],

          // Date utilities — swap moment for date-fns where possible
          'vendor-dates': ['date-fns', 'moment'],

          // DnD
          'vendor-dnd': ['@hello-pangea/dnd'],

          // Base44 SDK
          'vendor-base44': ['@base44/sdk'],

          // Misc utilities
          'vendor-utils': ['lodash', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
  },
});
