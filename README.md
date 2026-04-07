# Compose Docs

一个基于 `Vite + Vue 3` 的 Jetpack Compose 文档站，当前包含：

- 构建期生成的 `docs-index.json`
- 首页分类浏览与轻量搜索
- 文档详情页、上下篇导航、文内目录与当前章节高亮
- prerender 的首页和详情页静态 HTML
- `sitemap.xml` 与 `robots.txt`

## Development

```bash
npm install
npm run dev
```

本地开发会先生成 `public/docs-index.json`，然后启动 Vite。

## Build

```bash
npm run build
```

构建流程会自动执行：

1. 从 `public/docs/README.md` 生成 `public/docs-index.json`
2. 构建前端产物到 `dist/`
3. prerender 首页和每篇文档详情页
4. 生成 `dist/sitemap.xml` 和 `dist/robots.txt`

## Deployment

部署前建议配置环境变量：

```bash
VITE_SITE_URL=https://your-domain.example/compose-docs
```

它会影响：

- 客户端更新的 `canonical` / `description`
- prerender 生成的详情页 HTML 元信息
- `sitemap.xml`
- `robots.txt`

如果没有配置，默认会回退到占位地址 `https://example.com/compose-docs`。

可以复制模板文件开始：

```bash
cp .env.example .env.local
```
