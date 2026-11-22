// Tiny static-site builder for the UChicago AI Lab site.
// - src/layout.html wraps every page
// - src/pages/*.html are site pages (with a small front-matter block)
// - posts/*.md are blog posts (front matter + Markdown)
// Output goes to dist/. Run: npm run build

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const SITE = {
  name: "UChicago AI Lab",
  url: "https://www.uchicagoailab.com",
  description:
    "The AI Lab at the University of Chicago Law School teaches law students to build and ship AI products that make the law more accessible.",
};

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");

// ---------- helpers ----------
function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (val === "true") val = true;
    else if (val === "false") val = false;
    data[key] = val;
  }
  return { data, body: raw.slice(m[0].length) };
}

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function readingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230)) + " min read";
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

// Version tag for cache-busting: changes whenever the CSS or JS changes
const ASSET_VERSION = require("crypto")
  .createHash("sha1")
  .update(fs.readFileSync(path.join(SRC, "assets", "styles.css")))
  .update(fs.readFileSync(path.join(SRC, "assets", "main.js")))
  .digest("hex")
  .slice(0, 8);

const layout = fs.readFileSync(path.join(SRC, "layout.html"), "utf8")
  .replace("assets/styles.css", `assets/styles.css?v=${ASSET_VERSION}`)
  .replace("assets/main.js", `assets/main.js?v=${ASSET_VERSION}`);

function render({ title, description, content, root, active, outFile, canonical }) {
  const navKeys = ["about", "projects", "blog", "contact"];
  let html = layout
    .replaceAll("{{title}}", esc(title ? `${title} · ${SITE.name}` : `${SITE.name} · University of Chicago Law School`))
    .replaceAll("{{description}}", esc(description || SITE.description))
    .replaceAll("{{canonical}}", SITE.url + "/" + (canonical || ""))
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replace("{{content}}", content);
  for (const k of navKeys) html = html.replaceAll(`{{active_${k}}}`, active === k ? ' aria-current="page"' : "");
  html = html.replaceAll("{{root}}", root);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);
}

// ---------- posts ----------
const posts = fs
  .readdirSync(path.join(ROOT, "posts"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const raw = fs.readFileSync(path.join(ROOT, "posts", f), "utf8");
    const { data, body } = parseFrontMatter(raw);
    const slug = data.slug || f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
    return { ...data, slug, body, html: marked.parse(body), readTime: data.duration || readingTime(body) };
  })
  .filter((p) => !p.draft)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

function postCard(p, root) {
  return `
      <a class="post-card reveal" href="${root}blog/${p.slug}.html">
        <div class="post-card__meta"><span class="tag">${esc(p.category || "Essay")}</span><span>${fmtDate(p.date)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary || "")}</p>
        <span class="post-card__more">${p.category === "Video" ? "Watch" : "Read"} <span aria-hidden="true">→</span></span>
      </a>`;
}

// ---------- build ----------
fs.rmSync(DIST, { recursive: true, force: true });
copyDir(path.join(SRC, "assets"), path.join(DIST, "assets"));

// Pages
for (const f of fs.readdirSync(path.join(SRC, "pages")).filter((f) => f.endsWith(".html"))) {
  const { data, body } = parseFrontMatter(fs.readFileSync(path.join(SRC, "pages", f), "utf8"));
  const content = body.replace(
    "{{latest_posts}}",
    posts.slice(0, 3).map((p) => postCard(p, "")).join("") ||
      `<p class="muted">New writing is on the way.</p>`
  );
  render({
    title: data.title,
    description: data.description,
    content,
    root: "",
    active: data.active,
    outFile: path.join(DIST, f),
    canonical: f === "index.html" ? "" : f,
  });
}

// Blog index
render({
  title: "Writing",
  description: "Announcements, webinars, build logs, and thought pieces from the UChicago AI Lab.",
  root: "../",
  active: "blog",
  outFile: path.join(DIST, "blog", "index.html"),
  canonical: "blog/",
  content: `
  <section class="page-hero page-hero--compact on-dark">
    <div class="container">
      <p class="eyebrow"><span class="dot"></span>Writing</p>
      <h1 class="display">Notes from the Lab</h1>
      <p class="lede">Announcements, webinars, build logs, and thought pieces on AI, legal technology, and access to justice.</p>
    </div>
  </section>
  <section class="section section--paper">
    <div class="container">
      <div class="post-grid">${posts.map((p) => postCard(p, "../")).join("")}</div>
    </div>
  </section>`,
});

// Individual posts
for (const p of posts) {
  render({
    title: p.title,
    description: p.summary,
    root: "../",
    active: "blog",
    outFile: path.join(DIST, "blog", `${p.slug}.html`),
    canonical: `blog/${p.slug}.html`,
    content: `
  <article>
    <header class="page-hero page-hero--compact post-hero on-dark">
      <div class="container container--narrow">
        <a class="back-link" href="../blog/index.html">← All writing</a>
        <p class="eyebrow"><span class="dot"></span>${esc(p.category || "Essay")}</p>
        <h1 class="display">${esc(p.title)}</h1>
        <p class="post-meta">${esc(p.author || "UChicago AI Lab")} · ${fmtDate(p.date)} · ${p.readTime}</p>
      </div>
    </header>
    <div class="section section--paper">
      <div class="container container--narrow prose">${p.html}</div>
    </div>
  </article>`,
  });
}

// RSS feed
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(SITE.name)}</title><link>${SITE.url}</link><description>${esc(SITE.description)}</description>
${posts
  .map(
    (p) => `<item><title>${esc(p.title)}</title><link>${SITE.url}/blog/${p.slug}.html</link><guid>${SITE.url}/blog/${p.slug}.html</guid><pubDate>${new Date(p.date + "T12:00:00Z").toUTCString()}</pubDate><description>${esc(p.summary || "")}</description></item>`
  )
  .join("\n")}
</channel></rss>`;
fs.writeFileSync(path.join(DIST, "feed.xml"), rss);

// Custom domain for GitHub Pages
fs.writeFileSync(path.join(DIST, "CNAME"), "www.uchicagoailab.com\n");

console.log(`Built ${fs.readdirSync(path.join(SRC, "pages")).length} pages and ${posts.length} posts into dist/`);
