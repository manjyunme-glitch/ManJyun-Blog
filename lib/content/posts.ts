import { getDb } from "@/lib/db/client";
import type { PostRow, PostStatus, TagRow } from "@/lib/db/types";
import { makeExcerpt, makeSlug, readingMinutes } from "@/lib/content/markdown";
import { newId, nowIso } from "@/lib/utils";

export type Post = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  excerpt: string;
  content: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: TagRow[];
  readingMinutes: number;
};

export type PostInput = {
  title: string;
  slug?: string;
  status: PostStatus;
  excerpt?: string;
  content: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  tags?: string[];
};

function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    excerpt: row.excerpt || makeExcerpt(row.content),
    content: row.content,
    coverImage: row.cover_image || "",
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
    featured: row.featured === 1,
    publishedAt: row.published_at,
    scheduledAt: row.scheduled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: getTagsForPost(row.id),
    readingMinutes: readingMinutes(row.content)
  };
}

export function getTagsForPost(postId: string): TagRow[] {
  return getDb()
    .prepare(
      `SELECT tags.* FROM tags
       INNER JOIN post_tags ON post_tags.tag_id = tags.id
       WHERE post_tags.post_id = ?
       ORDER BY tags.name COLLATE NOCASE`
    )
    .all(postId) as TagRow[];
}

export function listTags() {
  return getDb()
    .prepare(
      `SELECT tags.*, COUNT(post_tags.post_id) AS post_count
       FROM tags
       LEFT JOIN post_tags ON post_tags.tag_id = tags.id
       GROUP BY tags.id
       ORDER BY tags.name COLLATE NOCASE`
    )
    .all() as Array<TagRow & { post_count: number }>;
}

export function listAdminPosts() {
  const rows = getDb()
    .prepare("SELECT * FROM posts ORDER BY updated_at DESC")
    .all() as PostRow[];
  return rows.map(rowToPost);
}

export function listPublishedPosts(options: { limit?: number; tagSlug?: string; q?: string; featured?: boolean } = {}) {
  const now = nowIso();
  const args: unknown[] = [now, now];
  const clauses = [
    "((posts.status = 'published' AND (posts.published_at IS NULL OR posts.published_at <= ?)) OR (posts.status = 'scheduled' AND posts.scheduled_at <= ?))"
  ];

  if (options.featured) {
    clauses.push("posts.featured = 1");
  }

  if (options.q) {
    clauses.push("(posts.title LIKE ? OR posts.excerpt LIKE ? OR posts.content LIKE ?)");
    const q = `%${options.q}%`;
    args.push(q, q, q);
  }

  let sql = `SELECT DISTINCT posts.* FROM posts`;
  if (options.tagSlug) {
    sql += ` INNER JOIN post_tags ON post_tags.post_id = posts.id
             INNER JOIN tags ON tags.id = post_tags.tag_id`;
    clauses.push("tags.slug = ?");
    args.push(options.tagSlug);
  }
  sql += ` WHERE ${clauses.join(" AND ")}
           ORDER BY COALESCE(posts.published_at, posts.scheduled_at, posts.created_at) DESC`;
  if (options.limit) {
    sql += " LIMIT ?";
    args.push(options.limit);
  }

  const rows = getDb().prepare(sql).all(...args) as PostRow[];
  return rows.map(rowToPost);
}

export function getPostBySlug(slug: string) {
  const row = getDb().prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as PostRow | undefined;
  return row ? rowToPost(row) : null;
}

export function getPublishedPostBySlug(slug: string) {
  const post = getPostBySlug(slug);
  if (!post) return null;
  const now = nowIso();
  if (post.status === "published" && (!post.publishedAt || post.publishedAt <= now)) return post;
  if (post.status === "scheduled" && post.scheduledAt && post.scheduledAt <= now) return post;
  return null;
}

export function getPostById(id: string) {
  const row = getDb().prepare("SELECT * FROM posts WHERE id = ?").get(id) as PostRow | undefined;
  return row ? rowToPost(row) : null;
}

export function ensureUniqueSlug(base: string, postId?: string) {
  const db = getDb();
  let candidate = makeSlug(base);
  let index = 2;
  while (true) {
    const row = db.prepare("SELECT id FROM posts WHERE slug = ?").get(candidate) as { id: string } | undefined;
    if (!row || row.id === postId) return candidate;
    candidate = `${makeSlug(base)}-${index}`;
    index += 1;
  }
}

function normalizeInput(input: PostInput, existing?: Post | null) {
  const now = nowIso();
  const title = input.title.trim() || "未命名文章";
  const content = input.content || "";
  const status = input.status || "draft";
  const publishedAt =
    status === "published" ? input.publishedAt || existing?.publishedAt || now : input.publishedAt || null;
  return {
    title,
    slug: ensureUniqueSlug(input.slug?.trim() || title, existing?.id),
    status,
    excerpt: input.excerpt?.trim() || makeExcerpt(content),
    content,
    coverImage: input.coverImage?.trim() || null,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
    featured: input.featured ? 1 : 0,
    publishedAt,
    scheduledAt: status === "scheduled" ? input.scheduledAt || null : input.scheduledAt || null,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    tags: (input.tags || []).map((tag) => tag.trim()).filter(Boolean)
  };
}

export function savePost(input: PostInput, id?: string) {
  const db = getDb();
  const existing = id ? getPostById(id) : null;
  const postId = id || newId("post");
  const normalized = normalizeInput(input, existing);

  const write = db.transaction(() => {
    db.prepare(
      `INSERT INTO posts (
        id, title, slug, status, excerpt, content, cover_image, seo_title, seo_description,
        featured, published_at, scheduled_at, created_at, updated_at
      ) VALUES (
        @id, @title, @slug, @status, @excerpt, @content, @coverImage, @seoTitle, @seoDescription,
        @featured, @publishedAt, @scheduledAt, @createdAt, @updatedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        slug = excluded.slug,
        status = excluded.status,
        excerpt = excluded.excerpt,
        content = excluded.content,
        cover_image = excluded.cover_image,
        seo_title = excluded.seo_title,
        seo_description = excluded.seo_description,
        featured = excluded.featured,
        published_at = excluded.published_at,
        scheduled_at = excluded.scheduled_at,
        updated_at = excluded.updated_at`
    ).run({ id: postId, ...normalized });
    setPostTags(postId, normalized.tags);
  });
  write();
  return getPostById(postId);
}

export function deletePost(id: string) {
  getDb().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

export function setPostTags(postId: string, tags: string[]) {
  const db = getDb();
  db.prepare("DELETE FROM post_tags WHERE post_id = ?").run(postId);
  const insertTag = db.prepare(
    "INSERT INTO tags (id, name, slug, color, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name = excluded.name"
  );
  const getTag = db.prepare("SELECT * FROM tags WHERE slug = ?");
  const insertJoin = db.prepare("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)");
  const seen = new Set<string>();
  for (const tagName of tags) {
    const slug = makeSlug(tagName, "tag");
    if (seen.has(slug)) continue;
    seen.add(slug);
    insertTag.run(newId("tag"), tagName, slug, null, nowIso());
    const tag = getTag.get(slug) as TagRow;
    insertJoin.run(postId, tag.id);
  }
}

export function relatedPosts(post: Post, limit = 3) {
  const tagSlugs = post.tags.map((tag) => tag.slug);
  if (!tagSlugs.length) {
    return listPublishedPosts({ limit }).filter((item) => item.id !== post.id).slice(0, limit);
  }
  const placeholders = tagSlugs.map(() => "?").join(",");
  const now = nowIso();
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT posts.* FROM posts
       INNER JOIN post_tags ON post_tags.post_id = posts.id
       INNER JOIN tags ON tags.id = post_tags.tag_id
       WHERE posts.id != ?
         AND tags.slug IN (${placeholders})
         AND ((posts.status = 'published' AND (posts.published_at IS NULL OR posts.published_at <= ?))
           OR (posts.status = 'scheduled' AND posts.scheduled_at <= ?))
       ORDER BY COALESCE(posts.published_at, posts.scheduled_at, posts.created_at) DESC
       LIMIT ?`
    )
    .all(post.id, ...tagSlugs, now, now, limit) as PostRow[];
  return rows.map(rowToPost);
}

