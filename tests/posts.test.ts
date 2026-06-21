import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("posts repository", () => {
  let dataDir: string;

  beforeEach(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "mjb-"));
    process.env.DATA_DIR = dataDir;
    vi.resetModules();
  });

  afterEach(async () => {
    const { resetDbForTests } = await import("@/lib/db/client");
    resetDbForTests();
    fs.rmSync(dataDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
  });

  it("saves tags and lists published posts", async () => {
    const { savePost, listPublishedPosts, listTags } = await import("@/lib/content/posts");
    const post = savePost({
      title: "Docker NAS 记录",
      status: "published",
      content: "## 起因\n\n正文",
      tags: ["Docker", "NAS"],
      featured: true
    });

    expect(post?.slug).toBe("docker-nas");
    expect(listPublishedPosts({ featured: true })).toHaveLength(1);
    expect(listTags().map((tag) => tag.name)).toEqual(["Docker", "NAS"]);
  });
});

