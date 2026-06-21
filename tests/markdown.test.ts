import { describe, expect, it, vi } from "vitest";
import { makeExcerpt, makeSlug, readingMinutes, stripMarkdown } from "@/lib/content/markdown";

describe("markdown helpers", () => {
  it("creates stable slugs with fallback", () => {
    vi.spyOn(Date, "now").mockReturnValue(1782018000000);
    expect(makeSlug("Docker Compose on NAS")).toBe("docker-compose-on-nas");
    expect(makeSlug("纯中文标题", "post")).toBe("post-1782018000000");
    vi.restoreAllMocks();
  });

  it("strips markdown for excerpts and reading time", () => {
    const source = "## 标题\n\n[链接](https://example.com) 和 `code`。\n\n```bash\ndocker ps\n```";
    expect(stripMarkdown(source)).toContain("链接 和 code");
    expect(makeExcerpt(source, 8)).toMatch(/\.\.\.$/);
    expect(readingMinutes(source)).toBeGreaterThanOrEqual(1);
  });
});

