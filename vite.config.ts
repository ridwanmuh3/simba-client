import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const backendTarget = "http://localhost:3000";
  const rootEnv = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const clientEnv = loadEnv(mode, __dirname, "");
  const appVersion =
    process.env.TAG ||
    rootEnv.TAG ||
    clientEnv.VITE_APP_VERSION ||
    rootEnv.APP_VERSION ||
    "dev";

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    },
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
            const pkg = id.split("node_modules/")[1]?.split("/")[0] ?? "";
            const scopedPkg = pkg.startsWith("@") ? pkg + "/" + (id.split("node_modules/")[1]?.split("/")[1] ?? "") : pkg;
            if (["recharts"].includes(pkg) || id.includes("/d3-") || scopedPkg.startsWith("d3")) {
              return "vendor-charts";
            }
            if (["react", "react-dom", "react-router", "react-router-dom", "react-is", "scheduler"].includes(pkg)) {
              return "vendor-react";
            }
            if (scopedPkg.startsWith("@radix-ui/") || ["cmdk", "vaul", "input-otp", "embla-carousel-react"].includes(pkg)) {
              return "vendor-ui";
            }
            if (["lucide-react"].includes(pkg)) {
              return "vendor-icons";
            }
            if (scopedPkg.startsWith("@tanstack/")) {
              return "vendor-query";
            }
            if (["react-hook-form", "zod"].includes(pkg) || scopedPkg.startsWith("@hookform/")) {
              return "vendor-forms";
            }
            if (["axios", "dayjs", "clsx", "tailwind-merge", "class-variance-authority", "camelcase-keys", "snakecase-keys", "zustand", "use-debounce", "use-sync-external-store"].includes(pkg)) {
              return "vendor-utils";
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
