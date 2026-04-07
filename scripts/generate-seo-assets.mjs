import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const docsIndexPath = path.join(distDir, 'docs-index.json')
const siteUrl = (process.env.VITE_SITE_URL || 'https://example.com/compose-docs').replace(/\/$/, '')

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const main = async () => {
  const docsIndexRaw = await readFile(docsIndexPath, 'utf8')
  const docsIndex = JSON.parse(docsIndexRaw)
  const lastmod = docsIndex.lastUpdated
    ? new Date(docsIndex.lastUpdated.replace(' ', 'T') + ':00+08:00').toISOString()
    : new Date().toISOString()

  const urls = [
    {
      loc: `${siteUrl}/`,
      changefreq: 'daily',
      priority: '1.0',
    },
    ...docsIndex.docs.map((doc) => ({
      loc: `${siteUrl}/docs/${doc.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ]

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) => `  <url>
    <loc>${xmlEscape(url.loc)}</loc>
    <lastmod>${xmlEscape(lastmod)}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
    ),
    '</urlset>',
    '',
  ].join('\n')

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`

  await writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')
  await writeFile(path.join(distDir, 'robots.txt'), robots, 'utf8')

  console.log(`Generated sitemap.xml and robots.txt for ${urls.length} routes.`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
