import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const indexPath = path.join(distDir, 'index.html')
const docsIndexPath = path.join(distDir, 'docs-index.json')
const siteUrl = (process.env.VITE_SITE_URL || 'https://example.com/compose-docs').replace(/\/$/, '')

const ensureTag = (html, matcher, replacement, fallback) =>
  matcher.test(html) ? html.replace(matcher, replacement) : html.replace('</head>', `  ${fallback}\n  </head>`)

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const applySeo = (html, { title, description, canonical, ogType = 'article' }) => {
  const escapedTitle = escapeHtml(title)
  const escapedDescription = escapeHtml(description)
  const escapedCanonical = escapeHtml(canonical)

  let nextHtml = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapedTitle}</title>`)

  nextHtml = ensureTag(
    nextHtml,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapedDescription}" />`,
    `<meta name="description" content="${escapedDescription}" />`,
  )

  nextHtml = ensureTag(
    nextHtml,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapedCanonical}" />`,
    `<link rel="canonical" href="${escapedCanonical}" />`,
  )

  nextHtml = ensureTag(
    nextHtml,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapedTitle}" />`,
    `<meta property="og:title" content="${escapedTitle}" />`,
  )

  nextHtml = ensureTag(
    nextHtml,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapedDescription}" />`,
    `<meta property="og:description" content="${escapedDescription}" />`,
  )

  nextHtml = ensureTag(
    nextHtml,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:type" content="${ogType}" />`,
  )

  nextHtml = ensureTag(
    nextHtml,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapedCanonical}" />`,
    `<meta property="og:url" content="${escapedCanonical}" />`,
  )

  return nextHtml
}

const main = async () => {
  const [template, docsIndexRaw] = await Promise.all([
    readFile(indexPath, 'utf8'),
    readFile(docsIndexPath, 'utf8'),
  ])

  const docsIndex = JSON.parse(docsIndexRaw)

  const homeHtml = applySeo(template, {
    title: 'Compose 小课堂 | Jetpack Compose 学习手册',
    description: `Compose 小课堂收录 ${docsIndex.totalDocs} 篇 Jetpack Compose 主题文档，支持按分类浏览、搜索和单篇阅读。`,
    canonical: `${siteUrl}/`,
    ogType: 'website',
  })

  await writeFile(indexPath, homeHtml, 'utf8')

  for (const doc of docsIndex.docs) {
    const targetDir = path.join(distDir, 'docs', doc.slug)
    const canonical = `${siteUrl}/docs/${doc.slug}`
    const html = applySeo(template, {
      title: `${doc.title} | Compose 小课堂`,
      description: doc.summary || `${doc.title} 的 Jetpack Compose 学习笔记。`,
      canonical,
    })

    await mkdir(targetDir, { recursive: true })
    await writeFile(path.join(targetDir, 'index.html'), html, 'utf8')
  }

  console.log(`Prerendered home page and ${docsIndex.docs.length} doc routes.`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
