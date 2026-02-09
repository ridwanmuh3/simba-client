import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: isDev
      ? {
          host: "0.0.0.0",
          port: 5173,
          cors: true,
          proxy: {
            "/api": {
              target: "http://localhost:3000",
              changeOrigin: true,
            },
            "/uploads": {
              target: "http://localhost:3000",
              changeOrigin: true,
            },
          },
          allowedHosts: ["599b-202-46-68-32.ngrok-free.app"],
        }
      : undefined,
    preview: {
      port: 4173,
    },
  };
});
