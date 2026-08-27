---
title: hexo+github
categories: 其他
excerpt: 介绍 Hexo 静态博客框架：从目录结构、常用命令到将博客部署至 GitHub 的基本流程。
date: 2023-06-22 19:12:17
tags:
---
## Hexo简介

​Hexo是一个快速、简洁且高效的博客框架。Hexo 使用 Markdown（或其他渲染引擎）解析文章，在几秒内，即可利用靓丽的主题生成静态网页。

## Hexo 结构

```xml
.
├── _config.yml                     
├── package.json
├── public                   // 公共文件夹，这个文件夹用于存放生成的站点文件。
├── scaffolds                // 模板文件夹，存储page、draft、page的模板
├── source                   // 资源文件夹，这个文件夹用来存放内容。
|   ├── _drafts                     
|   └── _posts
└── themes
```

## Hexo 写作

```shell
hexo new [layout] <title>  # 创建一篇新文章或者新页面
```

layout: 文章的布局，通过_config.yml中的default_layout参数指定默认布局

```shell
git init
git add .
git commit -m "first commit"
git branch -M main
git remote 
git 
```
