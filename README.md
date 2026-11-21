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

Until the domain is connected, the site is live at https://kimballparker.github.io/uchicagoailab-website/.

To connect the domain once the DNS records below are in place: in the repo, open **Settings → Pages**. Enter `www.uchicagoailab.com` under **Custom domain**, click **Save**, wait for the DNS check to pass, then tick **Enforce HTTPS**. The source should stay set to **GitHub Actions**.

## Domain DNS (Namecheap)

The domain is moving from Squarespace Domains to Namecheap. When the transfer finishes, Squarespace's DNS stops answering for the domain, so these records must exist at Namecheap or both the website **and email** will go down.

In Namecheap, go to **Domain List → uchicagoailab.com → Manage**. Set **Nameservers** to **Namecheap BasicDNS**. Then, under **Advanced DNS → Host Records**, add:

| Type  | Host | Value |
|-------|------|-------|
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| CNAME | www  | kimballparker.github.io. |

Delete Namecheap's default parking records (the `URL Redirect` on `@` and the `CNAME` on `www` to `parkingpage.namecheap.com`).

**Keep Google Workspace email working.** Under **Mail Settings**, choose **Custom MX** and add `MX` on `@` → `smtp.google.com`, priority `1`. Then add a `TXT` record on `@` → `v=spf1 include:_spf.google.com ~all`. If Google Workspace shows a DKIM record for the domain (Admin console → Apps → Gmail → Authenticate email), add that `TXT` record too.

GitHub issues the HTTPS certificate automatically once DNS resolves, usually within an hour. After the new site is live, cancel the Squarespace **website** subscription.

## Customizing

- **Colors & fonts:** the tokens at the top of `src/assets/styles.css`. Colors follow UChicago's brand palette (Maroon `#800000`, greystones, goldenrod accent).
- **Logo:** `src/assets/logo.png` (header, hero, footer, social preview) and `src/assets/favicon.png` (browser tab). Replace those two files to update the logo everywhere. If you later get an SVG version, it will look even sharper.
- **Portrait:** drop a photo at `src/assets/kimball.jpg` and replace the `KP` placeholder in `index.html` and `about.html` with `<img src="assets/kimball.jpg" alt="Kimball Dean Parker">`.
