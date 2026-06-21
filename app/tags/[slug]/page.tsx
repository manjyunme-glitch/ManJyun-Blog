import { notFound } from "next/navigation";
import { listPublishedPosts, listTags } from "@/lib/content/posts";
import { getActiveTheme } from "@/lib/themes/registry";

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await params;
  const tag = listTags().find((item) => item.slug === slug);
  if (!tag) notFound();
  const posts = listPublishedPosts({ tagSlug: slug });
  const PostCard = getActiveTheme().PostCard;

  return (
    <div className="page-wrap narrow">
      <section className="archive-head">
        <span className="eyebrow">tag</span>
        <h1>#{tag.name}</h1>
        <p>{tag.post_count} 篇文章</p>
      </section>
      <div className="post-list">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} compact />
        ))}
      </div>
    </div>
  );
}

