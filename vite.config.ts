import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Base path for assets - use '/' for root domain, '/subdirectory/' for subdirectory
  base: '/',
  
  server: {
    // Enable proxy for API calls in development
    proxy: {
      "/api": {
        target: "http://localhost:4000", // Your backend server URL
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the /api prefix
      },
    },
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Manual chunking to prevent large single chunks and reduce memory pressure
          if (id.includes("node_modules")) {
            // IMPORTANT: Put React first to avoid circular dependency issues
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            // Split vendor chunks for better memory management
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            if (id.includes("@stripe") || id.includes("stripe")) {
              return "vendor-stripe";
            }
            if (id.includes("survey")) {
              return "vendor-survey";
            }
            // Default vendor chunk for other node_modules
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase to reduce chunk splitting warnings
  },
}));
