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
            includeAssets: ["favicon.ico", "apple-touch-icon.png"],
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
                        src: "android-chrome-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                    {
                        src: "apple-touch-icon.png",
                        sizes: "180x180",
                        type: "image/png",
                        purpose: "apple touch icon",
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
