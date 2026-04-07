import { Marked, Renderer, Lexer } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js/lib/core'
import groovy from 'highlight.js/lib/languages/groovy'
import kotlin from 'highlight.js/lib/languages/kotlin'
import markdown from 'highlight.js/lib/languages/markdown'
import 'highlight.js/styles/atom-one-dark.css'

hljs.registerLanguage('groovy', groovy)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('markdown', markdown)

const createSlugger = () => {
  const seen = new Map()

  return (value) => {
    const base = String(value)
      .trim()
      .toLowerCase()
      .replace(/[`~!@#$%^&*()+=[\]{}|\\:;"'<>,.?/]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section'

    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }
}

const escapeAttribute = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export const parseMarkdown = (markdownSource) => {
  const source = markdownSource || ''
  const headings = []
  const slug = createSlugger()
  const renderer = new Renderer()

  renderer.heading = (text, level, raw) => {
    const id = slug(raw)
    const safeText = escapeAttribute(raw)

    if (level === 2 || level === 3) {
      headings.push({
        id,
        text: raw,
        level,
      })
    }

    return `<h${level} id="${id}" class="doc-heading"><a class="doc-heading-anchor" href="#${id}" aria-label="复制并跳转到 ${safeText}">#</a><span>${text}</span></h${level}>`
  }

  const parser = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(code, { language }).value
      },
    }),
    {
      renderer,
    },
  )

  return {
    html: parser.parse(source),
    headings,
  }
}

export const extractHeadings = (markdownSource) => {
  const source = markdownSource || ''
  const tokens = Lexer.lex(source)
  const slug = createSlugger()
  const headings = []

  for (const token of tokens) {
    if (token.type === 'heading' && (token.depth === 2 || token.depth === 3)) {
      headings.push({
        id: slug(token.text),
        text: token.text,
        level: token.depth,
      })
    }
  }

  return headings
}
