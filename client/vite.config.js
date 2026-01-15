import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: false,
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                modifyVars: {
                    // Custom Ant Design theme - Easy on the eyes
                    '@primary-color': '#1890ff', // Soft blue
                    '@success-color': '#52c41a', // Green
                    '@warning-color': '#faad14', // Orange
                    '@error-color': '#f5222d', // Red
                    '@font-size-base': '14px',
                    '@heading-color': 'rgba(0, 0, 0, 0.85)',
                    '@text-color': 'rgba(0, 0, 0, 0.65)',
                    '@text-color-secondary': 'rgba(0, 0, 0, 0.45)',
                    '@border-radius-base': '8px',
                    '@box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)',
                },
            },
        },
    },
})
