import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
  plugins: [
    react({ fastRefresh: true }),
    tailwindcss(),
  ],

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  server: {
    hmr: { overlay: false },
  },

  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom"))        return "react-dom";
            if (id.includes("react-router"))     return "react-router";
            if (id.includes("lucide-react"))     return "lucide";
            if (id.includes("socket.io") || id.includes("engine.io") || id.includes("debug")) return "socket-io";
            if (id.includes("radix-ui") || id.includes("@radix-ui")) return "radix";
            if (id.includes("react"))            return "react-core";
            return "vendor";
          }
          if (id.includes("/Features/ATS/") || id.includes("/Features/CRM/") || id.includes("/Features/HRMS/")) return "chunk-tools";
          if (id.includes("/Features/Analytics/") || id.includes("/Features/Projects/") || id.includes("/Features/Streaming/")) return "chunk-extras";
          if (id.includes("/Features/Messages/")) return "chunk-messages";
          if (id.includes("/Features/Feed/"))     return "chunk-feed";
          if (id.includes("/Features/Network/"))  return "chunk-network";
          if (id.includes("/Features/Profile/"))  return "chunk-profile";
          if (id.includes("/Features/jobs/"))     return "chunk-jobs";
          if (id.includes("/Features/Settings/")) return "chunk-settings";
          if (id.includes("/layouts/"))           return "chunk-layouts";
          if (id.includes("/components/ui/"))     return "chunk-ui";
          if (id.includes("/api/"))               return "chunk-api";
        },
        chunkFileNames:  "assets/[name]-[hash].js",
        entryFileNames:  "assets/[name]-[hash].js",
        assetFileNames:  "assets/[name]-[hash][extname]",
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    esbuildOptions: {
      legalComments: "none",
      drop: ["console", "debugger"],
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "lucide-react",
      "socket.io-client",
    ],
    force: false,
  },
})
