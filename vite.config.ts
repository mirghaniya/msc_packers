import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Async-load Vite-injected CSS to avoid render-blocking on first paint.
// Critical CSS is already inlined in index.html, so the swap is safe.
function asyncCssPlugin(): Plugin {
  return {
    name: "async-css",
    apply: "build",
    transformIndexHtml(html) {
      const noscriptLinks: string[] = [];
      const transformed = html.replace(
        /<link\s+([^>]*?)rel=["']stylesheet["']([^>]*?)>/g,
        (match, before: string, after: string) => {
          if (/\bdata-keep-blocking\b/.test(match)) return match;
          noscriptLinks.push(`<link rel="stylesheet" ${before}${after}>`);
          return `<link ${before}rel="stylesheet" ${after} media="print" onload="this.media='all'">`;
        }
      );
      if (!noscriptLinks.length) return transformed;
      return transformed.replace(
        "</head>",
        `<noscript>${noscriptLinks.join("")}</noscript></head>`
      );
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/__l5e/assets-v1": {
        target: "https://id-preview--85ae2f6a-c5f8-4e93-8cd0-7d7a94c45b45.lovable.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), asyncCssPlugin()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    legalComments: "none",
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Keep react + react-dom + scheduler + jsx-runtime together to avoid init-order issues
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("/react/jsx-runtime") ||
            id.includes("/react/jsx-dev-runtime")
          ) {
            return "react-vendor";
          }
          if (id.includes("@radix-ui")) return "radix-vendor";
          if (id.includes("@supabase")) return "supabase-vendor";
          if (id.includes("@tanstack")) return "query-vendor";
          if (id.includes("react-router")) return "router-vendor";
          if (id.includes("lucide-react")) return "icons-vendor";
        },
      },
    },
  },
}));
