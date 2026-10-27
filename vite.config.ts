import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { siteConfig } from "./src/config/site";

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function siteMeta(): Plugin {
  const values: Record<string, string> = {
    NAME: siteConfig.name,
    LANG: siteConfig.lang,
    TITLE: siteConfig.seo.title,
    DESCRIPTION: siteConfig.seo.description,
    URL: siteConfig.seo.url,
    THEME: siteConfig.seo.themeColor,
    INK: siteConfig.seo.inkColor,
    SCHEME: siteConfig.seo.colorScheme,
    OGALT: siteConfig.seo.ogAlt,
  };
  return {
    name: "site-meta",
    transformIndexHtml(html) {
      return html.replace(/%SITE_([A-Z]+)%/g, (match, key: string) =>
        key in values ? escapeAttr(values[key]) : match,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteMeta()],
  build: {
    target: "es2022",
    cssCodeSplit: true,
  },
});
