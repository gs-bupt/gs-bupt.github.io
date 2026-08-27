---
title: Hexo 博客 Markdown 渲染器更换实践
date: 2026-08-27 11:30:00
categories:
  - 编程工具
tags:
  - Hexo
  - Markdown
  - KaTeX
excerpt: 对比 Hexo 的 marked 与 markdown-it 渲染器，并记录切换和验证步骤。
---

## 为什么更换渲染器

Hexo 默认常见的渲染器是 `hexo-renderer-marked`。它足够简单，但在插件扩展、表格、脚注、容器和数学公式方面，`markdown-it` 的生态更完整，也更容易按需组合规则。

本博客最终选择 `hexo-renderer-markdown-it`，并通过 KaTeX 插件渲染行内和独立公式。

## 安装与切换

先移除旧渲染器，再安装新渲染器和需要的插件：

```bash
npm uninstall hexo-renderer-marked
npm install --save hexo-renderer-markdown-it @renbaoshuo/markdown-it-katex
```

如果项目使用 `package-lock.json`，安装完成后应提交 lockfile，CI 使用 `npm ci` 保证本地和线上依赖一致。

在 `_config.yml` 中配置插件，例如：

```yaml
markdown:
  preset: default
  render:
    html: true
    breaks: true
    linkify: true
  plugins:
    - markdown-it-checkbox
    - markdown-it-imsize
    - "@renbaoshuo/markdown-it-katex"
```

数学公式可以写成：

```markdown
行内公式 $a^2+b^2=c^2$。

$$
E = mc^2
$$
```

## 迁移时需要检查什么

不同渲染器对 HTML、换行、代码块和转义字符的处理可能不同。迁移后建议逐篇检查：

1. 标题层级、列表和表格是否保持原样；
2. 图片相对路径是否仍然有效；
3. 代码块是否带有正确的语言标识；
4. 公式页面是否加载 KaTeX 样式且没有残留 `$` 分隔符；
5. 生成目录中是否出现预期的文章和资源。

```bash
npm run clean
npm run check
npm run server
```

当前仓库已经将这些检查纳入 CI，避免后续依赖升级再次破坏公式或文章资源。
