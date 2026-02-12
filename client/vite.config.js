import { defineConfig } from "vite";
// @ts-ignore
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            devOptions: {
                enabled: true, //PROD: not recommended for production
            },
            includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
            manifest: {
                name: "Gestion Absences",
                short_name: "Absences",
                description: "Application de gestion des absences étudiantes",
                theme_color: "#3e7e86",
                background_color: "#ffffff",
                display: "standalone",
                start_url: "/",
                scope: "/",
                id: "/",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB
            },
        }),
    ],
    server: {
        allowedHosts: true, //PROD: not recommended for production (use allowedHosts: ['mon-app-absences.com'] for production)
    },
});
