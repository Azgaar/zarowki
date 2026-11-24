import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

// GitHub Pages serves the app from /<repo-name>/; the deploy workflow passes it in.
const base = process.env.BASE_PATH ?? "/";

const read = (path: string): string => readFileSync(new URL(path, import.meta.url), "utf8");

// Changes with everything that decides the cards and the prompts, but not with the look or the wording.
const gameVersion = createHash("sha256")
  .update(["prng", "seededDeal", "types"].map(name => read(`./src/game/${name}.ts`)).join())
  .update(
    (JSON.parse(read("./src/data/prompts.en.json")) as { id: string; rating: string }[])
      .map(p => `${p.id}:${p.rating}`)
      .join()
  )
  .digest("hex")
  .slice(0, 6);

export default defineConfig({
  base,
  define: { __GAME_VERSION__: JSON.stringify(gameVersion) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // src/update.ts decides when a new version is used.
      registerType: "prompt",
      includeAssets: ["icon.svg", "icon-512.png"],
      workbox: { clientsClaim: true, globPatterns: ["**/*.{js,css,html,svg,png,woff2}"] },
      manifest: {
        name: "Żarówki",
        short_name: "Żarówki",
        lang: "pl",
        display: "standalone",
        orientation: "any",
        start_url: base,
        scope: base,
        background_color: "#2B2350",
        theme_color: "#2B2350",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  test: { include: ["src/**/*.test.ts"] }
});
