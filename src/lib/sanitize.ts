import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li", "h3", "h4", "blockquote", "code", "img"];
const ALLOWED_ATTR = ["href", "title", "target", "rel", "src", "alt"];

/** Path Supabase Storage always uses for public objects in the content-images bucket. */
const CONTENT_IMAGE_PATH = "/storage/v1/object/public/content-images/";

function isSafeLink(rawUrl: string): boolean {
  if (rawUrl.startsWith("mailto:")) return true;
  if (!rawUrl.startsWith("https://")) return false;
  try {
    return new URL(rawUrl).protocol === "https:";
  } catch {
    return false;
  }
}

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    const href = node.getAttribute("href") ?? "";
    if (!isSafeLink(href)) {
      node.removeAttribute("href");
    }
    if (node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noopener noreferrer");
    }
  }
  if (node.tagName === "IMG") {
    const src = node.getAttribute("src") ?? "";
    if (!src.startsWith("https://") || !src.includes(CONTENT_IMAGE_PATH)) {
      node.remove();
      return;
    }
    if (!node.getAttribute("alt")) node.remove();
  }
});

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
