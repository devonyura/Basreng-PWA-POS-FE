/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 8100, // Ubah port menjadi 8100
		// proxy: {
		// 	'/api': {
		// 		target: 'https://api.rindapermai.com', // Ganti dengan URL backend
		// 		changeOrigin: true,
		// 		secure: false,
		// 	}
		// }
	},
	// preview: {
	// 	port: 8100, // Ubah port menjadi 8100
	// 	proxy: {
	// 		'/api': {
	// 			target: 'http://localhost:8080', // Ganti dengan URL backend
	// 			changeOrigin: true,
	// 			secure: false,
	// 		}
	// 	}
	// },
	optimizeDeps: {
		exclude: [`@ionic/pwa-elements/loader`],
	},
	build: {
		rollupOptions: {
				output: {
					manualChunks: {
					vendor: ['react', 'react-dom'],
					ionic: ['@ionic/react']
				},
				entryFileNames: `assets/[name]-[hash].js`,
				chunkFileNames: `assets/[name]-[hash].js`,
				assetFileNames: `assets/[name]-[hash].[ext]`
			}
		}
	},
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
			manifest: {
				name: 'Basreng POS',
				short_name: 'BasrengPOS',
				description: 'Point of Sale application for Basreng',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				icons: [
					{
						src: 'icon.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icon.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'icon.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
			},
			devOptions: {
				enabled: true
			}
		})
	],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/setupTests.ts',
	}
});
