import Link from "next/link";
import { listPublishedPosts, listTags } from "@/lib/content/posts";
import { getActiveTheme } from "@/lib/themes/registry";

export const dynamic = "force-dynamic";

export default async function ArchivePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }> | { q?: string };
}) {
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q : "";
  const posts = listPublishedPosts({ q });
  const tags = listTags();
  const PostCard = getActiveTheme().PostCard;

  return (
    <div className="page-wrap narrow">
      <section className="archive-head">
        <span className="eyebrow">archive</span>
        <h1>文章归档</h1>
        <form action="/archive">
          <input name="q" placeholder="搜索标题、摘要或正文" defaultValue={q} />
          <button type="submit">搜索</button>
        </form>
      </section>
      <section className="tag-cloud">
        <span>标签</span>
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            #{tag.name}
          </Link>
        ))}
      </section>
      <div className="post-list">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} compact />
        ))}
        {!posts.length ? <p className="empty-inline">没有找到匹配文章。</p> : null}
      </div>
    </div>
  );
}

