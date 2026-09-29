import { existsSync, readdirSync } from "node:fs";
import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";

/** Production domain. Override with SITE_URL=… for previews/staging. */
const SITE_URL = (process.env.SITE_URL ?? "https://availablecitychopsandgrill.com").replace(/\/+$/, "");
const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
const LOGO_NAME = "available-city-chops-and-grill-logo";

function listImages(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => IMAGE_RE.test(f) && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

function findLogo(): string | null {
  const files = listImages("public/images/logo");
  const preferred = files.find((f) => f.toLowerCase().startsWith(LOGO_NAME)) ?? files[0];
  return preferred ? `/images/logo/${preferred}` : null;
}

/**
 * Exposes the images in /public/images as `virtual:site-assets`, so adding or
 * removing a file (logo, product photo, flyer, gallery photo) needs no code change.
 */
function siteAssetsPlugin(): Plugin {
  const id = "virtual:site-assets";
  const resolved = "\0" + id;
  return {
    name: "site-assets",
    resolveId: (source) => (source === id ? resolved : undefined),
    load(source) {
      if (source !== resolved) return;
      return [
        `export const logo = ${JSON.stringify(findLogo())};`,
        `export const productImages = ${JSON.stringify(listImages("public/images/products"))};`,
        `export const flyerImages = ${JSON.stringify(listImages("public/images/flyers"))};`,
        `export const galleryImages = ${JSON.stringify(listImages("public/images/gallery"))};`,
      ].join("\n");
    },
    configureServer(server) {
      const onChange = (file: string) => {
        if (!file.replace(/\\/g, "/").includes("public/images/")) return;
        for (const env of Object.values(server.environments)) {
          const mod = env.moduleGraph.getModuleById(resolved);
          if (mod) env.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", onChange);
      server.watcher.on("unlink", onChange);
    },
  };
}

/** Canonical/OG URLs, favicon from the logo, robots.txt and sitemap.xml. */
function seoPlugin(): Plugin {
  return {
    name: "seo",
    transformIndexHtml(html) {
      const logo = findLogo();
      const tags = [
        `<link rel="canonical" href="${SITE_URL}/" />`,
        `<meta property="og:url" content="${SITE_URL}/" />`,
      ];
      const og = listImages("public/images/brand").find((f) => f.toLowerCase().startsWith("og-image"));
      const shareImage = og ? `/images/brand/${og}` : logo;
      if (shareImage) {
        tags.push(
          `<meta property="og:image" content="${SITE_URL}${shareImage}" />`,
          `<meta name="twitter:image" content="${SITE_URL}${shareImage}" />`,
        );
      }
      if (logo) {
        tags.push(`<link rel="icon" href="${logo}" />`, `<link rel="apple-touch-icon" href="${logo}" />`);
      } else {
        tags.push(`<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`);
      }
      return html
        .replace("<!--seo-tags-->", tags.join("\n    "))
        .replaceAll("__SITE_URL__", SITE_URL)
        .replace("__LOGO_URL__", logo ? `${SITE_URL}${logo}` : `${SITE_URL}/favicon.svg`);
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      });
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>
`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), siteAssetsPlugin(), seoPlugin()],
  build: {
    target: "es2020",
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
