import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a', 'span', 'div']
const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'class']

export function sanitizeProductHtml(input: string): string {
  return DOMPurify.sanitize(input || '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  })
}
