import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Inline every bundled asset (fonts, etc.) as base64 into the JS/CSS
    // instead of emitting separate files — this widget must ship as exactly
    // one JS + one CSS file, nothing else in assets/.
    assetsInlineLimit: 1024 * 1024,
  },
});
