import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "a", "ul", "ol", "li"];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
