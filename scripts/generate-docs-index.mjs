import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const docsDir = path.join(rootDir, 'public', 'docs')
const readmePath = path.join(docsDir, 'README.md')
const outputPath = path.join(rootDir, 'public', 'docs-index.json')

const normalizeDocPath = (input) => input.replace(/^\.\//, '').replace(/^\/+/, '')
const toSlug = (docPath) => normalizeDocPath(docPath).replace(/\.md$/i, '')

const extractUpdatedAt = (markdown) => {
  const match = markdown.match(/最后更新[：:]\s*(\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?)/)
  return match ? match[1] : null
}

const extractCatalogBlock = (markdown) => {
  const match = markdown.match(/##\s+分类导航\s*([\s\S]*?)(?:\n##\s+|$)/)

  if (!match) {
    throw new Error('README.md 中未找到“分类导航”区块')
  }

  return match[1]
}

const ensureDocExists = async (relativePath) => {
  const absolutePath = path.join(docsDir, normalizeDocPath(relativePath))
  await access(absolutePath)
}

const parseCatalog = async (markdown) => {
  const block = extractCatalogBlock(markdown)
  const lines = block.split(/\r?\n/)
  const categories = []
  const docs = []
  const seenSlugs = new Set()
  let currentCategory = null
  let order = 1

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      continue
    }

    const categoryMatch = line.match(/^###\s+(.+)$/)
    if (categoryMatch) {
      currentCategory = {
        name: categoryMatch[1].trim(),
        count: 0,
      }
      categories.push(currentCategory)
      continue
    }

    const docMatch = line.match(/^- \[([^\]]+)\]\(([^)]+)\)\s*(?:-\s*(.+))?$/)
    if (!docMatch) {
      continue
    }

    if (!currentCategory) {
      throw new Error(`文档条目缺少分类：${line}`)
    }

    const [, title, rawPath, rawSummary = ''] = docMatch
    const normalizedPath = normalizeDocPath(rawPath)
    const slug = toSlug(normalizedPath)

    if (seenSlugs.has(slug)) {
      throw new Error(`检测到重复 slug：${slug}`)
    }

    await ensureDocExists(normalizedPath)
    seenSlugs.add(slug)

    docs.push({
      slug,
      title: title.trim(),
      path: `docs/${normalizedPath}`,
      summary: rawSummary.trim(),
      category: currentCategory.name,
      order,
    })

    currentCategory.count += 1
    order += 1
  }

  return { categories, docs }
}

const main = async () => {
  const markdown = await readFile(readmePath, 'utf8')
  const { categories, docs } = await parseCatalog(markdown)

  const payload = {
    generatedAt: new Date().toISOString(),
    lastUpdated: extractUpdatedAt(markdown),
    totalDocs: docs.length,
    categories,
    docs,
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Generated ${path.relative(rootDir, outputPath)} with ${docs.length} docs.`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
