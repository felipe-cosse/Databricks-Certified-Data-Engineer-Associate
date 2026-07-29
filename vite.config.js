import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/")) {
            return "vendor";
          }

          if (id.includes("/content/")) {
            return "course-content";
          }

          if (
            id.includes("/src/data/glossary.js") ||
            id.includes("/src/lib/glossary.js")
          ) {
            return "glossary";
          }
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
});
