import slugify from "slugify";

export function makeSlug(value: string, fallbackPrefix = "post") {
  const slug = slugify(value, {
    lower: true,
    strict: true,
    locale: "zh"
  });
  return slug || `${fallbackPrefix}-${Date.now()}`;
}

export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/{{<[\s\S]*?>}}/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function makeExcerpt(markdown: string, length = 150) {
  const text = stripMarkdown(markdown);
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
}

export function readingMinutes(markdown: string) {
  const text = stripMarkdown(markdown);
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = text.replace(/[\u4e00-\u9fff]/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil((cjk / 500 + words / 220) || 1));
}
