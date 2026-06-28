const ALLOWED_FOOTNOTE_TAGS = new Set(['A', 'B', 'I'])
const ALLOWED_LINK_PROTOCOL = /^https?:\/\//i

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// Sanitizes generated car footnote HTML before rendering with innerHTML.
// Links and basic bold/italic formatting only.
export const sanitizeTrustedFootnoteHtml = (value: string): string => {
  if (typeof window === 'undefined') return escapeHtml(value)

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${value}</div>`, 'text/html')
  const root = doc.body.firstElementChild
  if (!root) return escapeHtml(value)

  const replaceWithText = (element: Element) => {
    element.replaceWith(doc.createTextNode(element.textContent ?? ''))
  }

  const sanitizeNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) return

    const element = node as HTMLElement
    const tagName = element.tagName

    if (!ALLOWED_FOOTNOTE_TAGS.has(tagName)) {
      replaceWithText(element)
      return
    }

    if (tagName === 'A') {
      const href = element.getAttribute('href')?.trim() ?? ''
      if (!ALLOWED_LINK_PROTOCOL.test(href)) {
        replaceWithText(element)
        return
      }

      element.setAttribute('href', href)
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener noreferrer')
    }

    for (const attr of [...element.attributes]) {
      if (tagName === 'A' && ['href', 'target', 'rel'].includes(attr.name)) continue
      element.removeAttribute(attr.name)
    }

    for (const child of [...element.childNodes]) {
      sanitizeNode(child)
    }
  }

  for (const child of [...root.childNodes]) {
    sanitizeNode(child)
  }

  return root.innerHTML
}
