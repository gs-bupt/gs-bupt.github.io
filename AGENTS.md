# Repository Guidelines

## Project Structure & Module Organization

This repository contains the Hexo source for a Chinese-language blog. Site-wide settings live in `_config.yml`; theme overrides are in `_config.fluid.yml` and `_config.landscape.yml`. Published articles belong in `source/_posts/`, while unfinished work stays in `source/_drafts/`. Static shared assets live under `source/img/` and `source/css/`. Because `post_asset_folder` is enabled, article-specific images should be placed in a directory beside the post with the same basename, for example `source/_posts/2023-08-20-transformer/`.

Hexo templates for new posts, drafts, and pages are in `scaffolds/`. Generated output (`public/`), deployment checkouts, and dependencies are ignored and must not be committed.

## Build, Test, and Development Commands

- `npm ci` installs the exact dependency tree from `package-lock.json`; use npm with Node.js 22.
- `npm run server` starts the local preview server; review changed pages in a browser.
- `npm run build` generates the production site in `public/` and is the main validation command.
- `npm run check` runs the checks required by continuous integration.
- `npm run clean` removes Hexo's cache and generated output; run it before rebuilding when output looks stale.
- `npm run github` cleans, builds, and deploys. Use it only when intentionally publishing and SSH access is configured.

## Content Style & Naming Conventions

Write articles in Markdown with YAML front matter matching `scaffolds/post.md`. Published filenames follow `YYYY-MM-DD-title.md`; use the same basename for an optional asset directory. Preserve the site's `zh-CN` language and existing Markdown conventions. Use fenced code blocks with a language identifier, relative image references for post assets, and meaningful headings. Keep YAML and configuration indentation at two spaces. In CSS, follow the existing four-space indentation.

## Testing Guidelines

There is no automated test framework or coverage requirement. Before submitting changes, run `npm run check` and treat any Hexo rendering error, broken asset reference, or malformed front matter as a failure. For content or styling changes, also run `npm run server` and visually check the affected post, navigation, code blocks, and images.

## Commit & Pull Request Guidelines

History uses brief summaries such as `transformer完成` and `add npm run github`. Keep commits short, imperative, and scoped to one change; prefer a specific message such as `add Redis caching post`. Pull requests should explain the content or configuration changed, confirm a successful build, and link any relevant issue. Include screenshots for theme, CSS, layout, or image changes. Never commit secrets, `node_modules/`, `public/`, or deployment output.
