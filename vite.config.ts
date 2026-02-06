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
          port: 9001,
          cors: true,
          proxy: {
            "/api": {
              target: "http://localhost:9000",
              changeOrigin: true,
            },
          },
        }
      : undefined,

    preview: {
      port: 4173,
    },
  };
});
