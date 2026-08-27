---
title: 心动星河：一个可交互的动态心形页面
date: 2026-08-27 15:00:00
tags:
  - HTML
  - CSS
  - JavaScript
  - Canvas
  - 创意编程
categories: 创意编程
excerpt: 用原生 HTML、CSS 和 Canvas 制作一张可交互的沉浸式心形动画页面。
---

这不是一篇普通的 Markdown 文章，而是一张可以直接打开、点击和探索的互动页面。它用 Canvas 实时渲染一颗由上千光点构成的 3D 粒子心形与全屏星河：心形持续自转，随鼠标产生立体倾斜，点击还会迸发一束粒子。

<iframe src="/heart-animation/" title="心动星河动态心形动画" loading="lazy" style="width:100%; height:680px; border:0; border-radius:24px; overflow:hidden; box-shadow:0 18px 60px rgba(70,25,135,.22);"></iframe>

[打开全屏互动页面](/heart-animation/)

## 可以怎样互动

- 移动鼠标：星河和中心心形会产生轻微的前后景深。
- 点击心形：释放一束粒子烟花，并切换一句新的文案。
- 点亮星河：增强环境光、粒子密度和心形的霓虹光晕。
- 全屏沉浸：让页面填满浏览器窗口；再次点击即可退出。

## 实现方式

页面位于 `source/heart-animation/`，是由 Hexo 原样发布的独立静态目录：`index.html` 负责结构与覆盖文案，`style.css` 负责 HUD 排版，`script.js` 用 Canvas 把三维心形点云投影成旋转的粒子心形，并处理星空、倾斜、迸发与全屏。这样既能保持文章作为文档入口，也能给互动体验完整的页面控制权。

为了照顾不同使用场景，页面不加载第三方图片与动画库（仅引入两款 Web 字体），并尊重系统的“减少动态效果”偏好设置。
