import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const backendTarget = "http://localhost:3000";
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            // Split only large/lazy-specific deps — no catch-all to avoid circular deps
            if (id.includes("recharts") || id.includes("/d3-") || id.includes("/d3/")) {
              return "vendor-charts";
            }
            if (id.includes("framer-motion") || id.includes("@motionone")) {
              return "vendor-motion";
            }
          },
        },
      },
    },
    server: isDev
      ? {
          host: "0.0.0.0",
          port: 5173,
          cors: true,
          proxy: {
            "/api": {
              target: backendTarget,
              changeOrigin: true,
            },
            "/uploads": {
              target: backendTarget,
              changeOrigin: true,
            },
          },
          allowedHosts: true,
        }
      : undefined,
    preview: {
      host: "0.0.0.0",
      port: 4173,
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: backendTarget,
          changeOrigin: true,
        },
      },
      allowedHosts: [".ngrok-free.app"],
    },
  };
});
