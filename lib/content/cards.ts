export type ContentBlock =
  | { type: "markdown"; body: string }
  | { type: "image"; attrs: Record<string, string> }
  | { type: "audio"; attrs: Record<string, string> }
  | { type: "video"; attrs: Record<string, string> }
  | { type: "bookmark"; attrs: Record<string, string> }
  | { type: "gallery"; attrs: Record<string, string>; items: GalleryItem[] }
  | { type: "html"; attrs: Record<string, string>; body: string };

export type GalleryItem = {
  src: string;
  caption?: string;
};

const tokenRe = /\{\{<\s*(\/?)([a-zA-Z0-9_-]+)([^>]*)>\}\}/g;

export function parseAttrs(source: string) {
  const attrs: Record<string, string> = {};
  const attrRe = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(source))) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

export function parseGallery(body: string): GalleryItem[] {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [src, caption] = line.split("|").map((part) => part.trim());
      return { src, caption: caption || undefined };
    });
}

export function parseContentBlocks(markdown: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let cursor = 0;
  tokenRe.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(markdown))) {
    const [full, closing, name, rawAttrs] = match;
    if (closing) continue;

    const before = markdown.slice(cursor, match.index);
    if (before.trim()) {
      blocks.push({ type: "markdown", body: before });
    }

    const attrs = parseAttrs(rawAttrs);
    const lowerName = name.toLowerCase();

    if (lowerName === "gallery" || lowerName === "html" || lowerName === "markdown") {
      const closeToken = `{{< /${name} >}}`;
      const closeIndex = markdown.indexOf(closeToken, tokenRe.lastIndex);
      if (closeIndex === -1) {
        blocks.push({ type: "markdown", body: full });
        cursor = tokenRe.lastIndex;
        continue;
      }

      const body = markdown.slice(tokenRe.lastIndex, closeIndex);
      if (lowerName === "gallery") {
        blocks.push({ type: "gallery", attrs, items: parseGallery(body) });
      } else if (lowerName === "html") {
        blocks.push({ type: "html", attrs, body });
      } else {
        blocks.push({ type: "markdown", body });
      }
      cursor = closeIndex + closeToken.length;
      tokenRe.lastIndex = cursor;
      continue;
    }

    if (["image", "audio", "video", "bookmark"].includes(lowerName)) {
      blocks.push({ type: lowerName as "image" | "audio" | "video" | "bookmark", attrs });
      cursor = tokenRe.lastIndex;
      continue;
    }

    blocks.push({ type: "markdown", body: full });
    cursor = tokenRe.lastIndex;
  }

  const tail = markdown.slice(cursor);
  if (tail.trim()) {
    blocks.push({ type: "markdown", body: tail });
  }

  return blocks.length ? blocks : [{ type: "markdown", body: markdown }];
}

