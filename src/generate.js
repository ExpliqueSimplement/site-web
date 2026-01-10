const fs = require("fs");
const path = require("path");

// ===== PATHS =====
const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const DIST_DIR = path.join(ROOT, "dist");
const ARTICLES_DIR = path.join(DIST_DIR, "articles");

const TEMPLATE_PATH = path.join(SRC_DIR, "template.html");
const ARTICLES_JSON_PATH = path.join(SRC_DIR, "articles.json");

const generateSitemap = require("./generate-sitemap");

// ===== UTILS =====
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadTemplate() {
  return fs.readFileSync(TEMPLATE_PATH, "utf-8");
}

function loadArticles() {
  const raw = fs.readFileSync(ARTICLES_JSON_PATH, "utf-8");
  return JSON.parse(raw);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ===== CONTENT RENDERING =====
function renderContent(blocks, articlesMap) {
  return blocks
    .map(block => {
      switch (block.type) {
        case "paragraph":
          return `<p>${escapeHtml(block.text)}</p>`;

        case "link": {
          const targetArticle = articlesMap[block.target];
          if (!targetArticle) return "";
          return `
            <p>
              <a href="/articles/${targetArticle.slug}.html">
                ${escapeHtml(block.text)}
              </a>
            </p>
          `;
        }

        default:
          return "";
      }
    })
    .join("\n");
}

function renderRelatedLinks(relatedIds, articlesMap) {
  return relatedIds
    .map(id => {
      const article = articlesMap[id];
      if (!article) return "";
      return `<li><a href="/articles/${article.slug}.html">${escapeHtml(article.title)}</a></li>`;
    })
    .join("\n");
}

// ===== ARTICLE GENERATION =====
function generateArticles(site, articles, template) {
  const articlesMap = {};
  articles.forEach(a => (articlesMap[a.id] = a));

  articles
    .filter(article => article.published)
    .forEach(article => {
      const contentHtml = renderContent(article.content, articlesMap);
      const relatedHtml = renderRelatedLinks(article.related || [], articlesMap);

      const canonicalUrl = `${site.baseUrl}/articles/${article.slug}.html`;

      let html = template
        .replace(/{{title}}/g, article.title)
        .replace(/{{description}}/g, article.description)
        .replace(/{{category}}/g, article.category)
        .replace(/{{content}}/g, contentHtml)
        .replace(/{{relatedLinks}}/g, relatedHtml)
        .replace(/{{canonicalUrl}}/g, canonicalUrl)
        .replace(/{{year}}/g, new Date().getFullYear());

      const outputPath = path.join(ARTICLES_DIR, `${article.slug}.html`);
      fs.writeFileSync(outputPath, html, "utf-8");
    });
}

// ===== INDEX GENERATION =====
function generateIndex(site, articles) {
  const published = articles.filter(a => a.published);

  const listItems = published
    .map(
      a => `
      <article class="index-article">
        <h2>
          <a href="/articles/${a.slug}.html">${escapeHtml(a.title)}</a>
        </h2>
        <p>${escapeHtml(a.description)}</p>
      </article>
    `
    )
    .join("\n");

  const indexHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="google-site-verification" content="NEFillxL9gfAChEdWh8GHgURNu0TiL3G6j7dV38C9BI" />
  <title>${site.name}</title>
  <meta name="description" content="Des explications simples et accessibles sur des sujets du quotidien." />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/public/style.css" />
</head>
<body>

<header class="site-header">
  <div class="container">
    <a href="/" class="logo">${site.name}</a>
  </div>
</header>

<main class="container">
  <h1>Articles récents</h1>
  ${listItems}
</main>

<footer class="site-footer">
  <div class="container">
    <p>© ${new Date().getFullYear()} ${site.name}</p>
  </div>
</footer>

</body>
</html>`;

  fs.writeFileSync(path.join(DIST_DIR, "index.html"), indexHtml, "utf-8");
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;

  ensureDir(dest);

  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}


// ===== MAIN =====
function build() {
  console.log("🔨 Génération du site...");

  ensureDir(DIST_DIR);
  ensureDir(ARTICLES_DIR);

  const template = loadTemplate();
  const data = loadArticles();

  generateArticles(data.site, data.articles, template);
  generateIndex(data.site, data.articles);

  copyDir(path.join(ROOT, "public"), path.join(DIST_DIR, "public"));

  console.log("✅ Site généré avec succès.");
  generateSitemap();
}

build();
