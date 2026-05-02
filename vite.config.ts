import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Defers the main bundled CSS so it doesn't block FCP.
// Critical above-the-fold styles are already inlined in index.html <head>.
const asyncCssPlugin = (): Plugin => ({
  name: "async-bundled-css",
  enforce: "post",
  apply: "build",
  transformIndexHtml(html) {
    return html.replace(
      /<link rel="stylesheet"(?: crossorigin)? href="(\/assets\/[^"]+\.css)">/g,
      (_m, href) =>
        `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'">` +
        `<noscript><link rel="stylesheet" href="${href}"></noscript>`
    );
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger(), asyncCssPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler")) return "react-vendor";
          if (id.includes("@supabase") || id.includes("@tanstack/react-query")) return "data-vendor";
          if (id.includes("@radix-ui") || id.includes("lucide-react") || id.includes("class-variance-authority") || id.includes("clsx") || id.includes("tailwind-merge")) return "ui-vendor";
          if (id.includes("react-router")) return "router-vendor";
          return "vendor";
        },
      },
    },
  },
}));
