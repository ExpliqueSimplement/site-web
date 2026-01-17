const fs = require("fs");
const path = require("path");
const articles = require("./articles.json");

const SITE_URL = "https://expliquesimplement.netlify.app";
const DIST_DIR = path.join(__dirname, "..", "dist");

function generateSitemap() {
  const urls = [];

  // Page d'accueil
  urls.push(`${SITE_URL}/`);

  // Pages articles
  articles.articles.forEach(article => {
    urls.push(`${SITE_URL}/articles/${article.slug}.html`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `
  <url>
    <loc>${url}</loc>
  </url>`
  )
  .join("")}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemap);
  console.log("🗺️ sitemap.xml généré");
}

module.exports = generateSitemap;
