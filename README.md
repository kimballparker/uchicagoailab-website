# UChicago AI Lab — website

A fast, static marketing site and blog. No CMS, no monthly fee.

## Structure

```
src/layout.html        Shared header, nav and footer (edit once, applies everywhere)
src/pages/*.html       Site pages: index (home), about, projects
src/assets/            styles.css, main.js, logo.png, favicon.png  (add photos here too)
posts/*.md             Blog posts in Markdown
build.js               Builds everything into dist/
```

## Run it locally

```bash
npm install
npm run dev        # builds and serves at http://localhost:3000
```

## Write a blog post

Add a file to `posts/` named `YYYY-MM-DD-your-slug.md`:

```markdown
---
title: Your post title
date: 2026-12-01
author: Kimball Dean Parker
category: Essay
summary: One or two sentences shown on the cards and in search results.
---

Your post in Markdown. **Bold**, _italics_, [links](https://example.com),
> pull quotes, lists, images, and so on.
```

To embed a YouTube video, set `category: Video` (the card will say "Watch") and optionally `duration: 1 hr video`, then paste this into the post, swapping in the video ID:

```html
<div class="video">
  <iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID?rel=0" title="Video title" loading="lazy" allowfullscreen></iframe>
</div>
```

Add `draft: true` to the front matter to keep a post from being published.
The blog index, the "Latest writing" cards on the home page, and the RSS feed (`/feed.xml`) update automatically.

## Hosting (free) on GitHub Pages

The site is hosted on GitHub Pages. `.github/workflows/deploy.yml` builds the site and publishes it every time you push to `main`, so publishing a post means committing a new `.md` file to `posts/`. You can do that right in GitHub's web editor.

The custom domain (`www.uchicagoailab.com`) is written into the build as a `CNAME` file. In the repo's **Settings → Pages**, the source should be **GitHub Actions**, and **Enforce HTTPS** should be on.

## Domain DNS (Squarespace Domains)

The domain is registered at Squarespace Domains. Under **Domains → uchicagoailab.com → DNS**:

1. Remove the Squarespace website records: the four `A` records on `@` (198.185.159.x and 198.49.23.x) and the `www` CNAME to `ext-sq.squarespace.com`. If Squarespace shows them as a "Squarespace Defaults" preset, delete that preset.
2. Add these custom records:
   - `A` record on `@` → `185.199.108.153`
   - `A` record on `@` → `185.199.109.153`
   - `A` record on `@` → `185.199.110.153`
   - `A` record on `@` → `185.199.111.153`
   - `CNAME` record on `www` → `YOUR-GITHUB-USERNAME.github.io`
3. **Leave the Google Workspace email records alone:** the `MX` record (`smtp.google.com`) and the `TXT` SPF record. Removing them would break email on the domain.

GitHub issues the HTTPS certificate automatically once DNS resolves, usually within an hour. After the new site is live, cancel the Squarespace **website** subscription but keep the **domain** registration. If you later move the domain to Namecheap, recreate the same records there, including the email ones.

## Customizing

- **Colors & fonts:** the tokens at the top of `src/assets/styles.css`. Colors follow UChicago's brand palette (Maroon `#800000`, greystones, goldenrod accent).
- **Logo:** `src/assets/logo.png` (header, hero, footer, social preview) and `src/assets/favicon.png` (browser tab). Replace those two files to update the logo everywhere. If you later get an SVG version, it will look even sharper.
- **Portrait:** drop a photo at `src/assets/kimball.jpg` and replace the `KP` placeholder in `index.html` and `about.html` with `<img src="assets/kimball.jpg" alt="Kimball Dean Parker">`.
