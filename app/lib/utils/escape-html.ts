// app/lib/utils/escape-html.ts
// Escape user-supplied text before interpolation into HTML email templates.
// Prevents stored-XSS via messages rendered in <p>, <blockquote>, etc.

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
