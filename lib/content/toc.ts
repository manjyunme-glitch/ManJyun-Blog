import { makeSlug } from "@/lib/content/markdown";

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const text = match[2].replace(/[#*_`[\]()]/g, "").trim();
    const base = makeSlug(text, "section");
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    items.push({
      id: count ? `${base}-${count + 1}` : base,
      text,
      level: match[1].length
    });
  }
  return items;
}

