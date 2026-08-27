# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` contains the repository's content-style, naming, and commit conventions (brief imperative commits, e.g. `add Redis caching post`); follow it for anything not covered here.

## Project

Chinese-language (`zh-CN`) blog built with Hexo 6.3 on Node 22 (pinned in `.nvmrc`; npm >=10 <11). Published to GitHub Pages at `https://www.hahahaha.space` (see `source/CNAME`).

## Commands

- `npm ci` — install (exact lockfile; always use this, not `npm install`).
- `npm run server` — local preview server; visually check content/style changes here.
- `npm run build` — `hexo generate` into `public/`.
- `npm run check` — **the main validation command** (also what CI runs): builds, then runs the three checks below. Run this before considering any change done.
- `npm run check:math` — verifies KaTeX output in the generated HTML of a fixed reference article.
- `npm run check:site` — validates every post's filename, front matter, and local image references.
- `npm run check:heart` — enforces the heart-animation performance budget (see below).
- `npm run check:deployment` — smoke-tests the live site; requires `SITE_URL` env var (CI sets it post-deploy; skip locally).
- `npm run clean` — clear Hexo cache/`public/`; run before rebuilding when output looks stale.

There is no unit-test framework and no coverage requirement — the `test/*.js` scripts are the entire test suite; there is no "single test" runner beyond `node test/<script>.js`.

## Architecture

**Two-layer configuration.** `_config.yml` holds site-wide settings (URL, permalink format, Markdown pipeline); `_config.fluid.yml` holds all theme overrides. The Fluid theme comes from the `hexo-theme-fluid` npm package — `themes/` is intentionally empty, so theme behavior is customized only through `_config.fluid.yml` and custom CSS, never by editing theme files.

**Markdown pipeline.** Rendering uses `hexo-renderer-markdown-it` with a plugin stack declared in `_config.yml` (`markdown:` block): KaTeX via `@renbaoshuo/markdown-it-katex`, `markdown-it-container` (success/tips/warning/danger callouts), checkbox, imsize, expandable, CJK breaks. Math rendering is gated per-post: the theme is configured with `math.specific: true`, so **any post containing formulas must have `math: true` in its front matter** or formulas render as raw LaTeX. Changing the renderer or KaTeX version risks breaking the pinned checks in `check-math-rendering.js` and `check-deployment.js`, which both target `2023-09-18-知识蒸馏开山之作论文精读`.

**Content rules enforced by `check-site.js`:** posts must live directly under `source/_posts/` (flat, no nesting), be named `YYYY-MM-DD-title.md`, and have YAML front matter with `title` and `date` (scaffold: `scaffolds/post.md`). `post_asset_folder` is enabled: a post's images go in a sibling directory with the same basename (e.g. `2023-08-20-transformer/` beside `2023-08-20-transformer.md`) and must be referenced with relative paths — the check resolves every local image reference. Drafts live in `source/_drafts/` and are never rendered (`render_drafts: false`).

**Permalinks** are `:year/:month/:day/:title/` with the raw post title (often Chinese) in the URL path — relevant when hardcoding links or updating deployment checks, which percent-encode these paths.

**`source/heart-animation/`** is a standalone static page listed under `skip_render` in `_config.yml`, so Hexo copies it through unprocessed; it is embedded in a post via `<iframe src="/heart-animation/">`. It is a realtime Canvas 3D particle heart: `script.js` builds and projects the rotating point cloud plus starfield, `style.css` only styles the HUD overlay. Modifications must satisfy `test/check-heart-animation.js`, which encodes the design contract: canvas + `requestAnimationFrame` rendering, `prefers-reduced-motion` respected, devicePixelRatio and transient burst counts capped, pointer tilt and click bursts wired.

**Site-wide custom CSS** lives at `source/css/markdown.css`, wired in via `custom_css` in `_config.fluid.yml`.

## CI/CD (`.github/workflows/pages.yml`)

- Push to `main`: build + `npm run check` → deploy to GitHub Pages → `check:deployment` smoke test against the deployed URL.
- Pull request: same build/check, no deploy; uploads a `site-preview-pr-<n>` artifact retained for 7 days.
- `workflow_dispatch` republishes the current commit.
- Dependabot groups Hexo-stack minor/patch updates; keep `package-lock.json` in sync.
