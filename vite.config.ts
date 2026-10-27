import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { siteConfig } from "./src/config/site.ts";

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function baseLessons() {
  const root = join(import.meta.dirname, "src/locales/es/content");
  const list: { world: string; lesson: string }[] = [];
  for (const world of readdirSync(root, { withFileTypes: true })) {
    if (!world.isDirectory()) continue;
    for (const file of readdirSync(join(root, world.name)).filter((f) => /^l\d.*\.ts$/.test(f)).sort()) {
      const id = readFileSync(join(root, world.name, file), "utf8").match(/^\s*id:\s*"([^"]+)"/m)?.[1];
      if (id) list.push({ world: world.name, lesson: id });
    }
  }
  return list;
}

function siteMeta(): Plugin {
  const url = siteConfig.seo.url.replace(/\/$/, "");
  const values: Record<string, string> = {
    NAME: siteConfig.name,
    LANG: siteConfig.lang,
    TITLE: siteConfig.seo.title,
    DESCRIPTION: siteConfig.seo.description,
    URL: url,
    THEME: siteConfig.seo.themeColor,
    INK: siteConfig.seo.inkColor,
    SCHEME: siteConfig.seo.colorScheme,
    OGALT: siteConfig.seo.ogAlt,
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    url: `${url}/`,
    description: siteConfig.seo.description,
    inLanguage: siteConfig.lang,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return {
    name: "site-meta",
    transformIndexHtml(html) {
      return html
        .replace("%SITE_JSONLD%", JSON.stringify(jsonLd).replace(/</g, "\\u003c"))
        .replace(/%SITE_([A-Z]+)%/g, (match, key: string) => (key in values ? escapeAttr(values[key]) : match));
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = [`${url}/`, ...baseLessons().map((l) => `${url}/?lesson=${l.world}/${l.lesson}`)];
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${escapeAttr(u)}</loc><lastmod>${today}</lastmod></url>`)
          .join("\n")}\n</urlset>\n`,
      });
      this.emitFile({ type: "asset", fileName: "robots.txt", source: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n` });
    },
  };
}

const LOCALE_CHUNK = /src[\/]locales[\/]([^\/]+)[\/](?:messages\.ts|content[\/])/;

export default defineConfig({
  plugins: [react(), tailwindcss(), siteMeta()],
  build: {
    target: "es2022",
    cssCodeSplit: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\/](react|react-dom|scheduler)[\/]/ },
            { name: (id) => `locale-${id.match(LOCALE_CHUNK)![1]}`, debugName: "locale", test: LOCALE_CHUNK },
          ],
        },
      },
    },
  },
});
