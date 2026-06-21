import type { Metadata } from "next";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { extractToc } from "@/lib/content/toc";
import { getPublishedPostBySlug, relatedPosts } from "@/lib/content/posts";
import { RichContent } from "@/components/public/RichContent";
import { getActiveTheme } from "@/lib/themes/registry";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.coverImage ? [post.coverImage] : []
    }
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);
  if (!post) notFound();
  const toc = extractToc(post.content);
  const related = relatedPosts(post);
  const PostCard = getActiveTheme().PostCard;
  const date = post.publishedAt || post.scheduledAt || post.createdAt;

  return (
    <article className="article-page">
      <header className="article-hero">
        <div>
          <Link href="/archive" className="back-link">
            ← 归档
          </Link>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="post-meta">
            <time dateTime={date}>{format(new Date(date), "yyyy.MM.dd")}</time>
            <span>{post.readingMinutes} min</span>
            {post.tags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
        {post.coverImage ? <img src={post.coverImage} alt="" /> : null}
      </header>
      <div className="article-layout">
        <aside className="toc">
          <strong>目录</strong>
          {toc.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={item.level === 3 ? "indent" : ""}>
              {item.text}
            </a>
          ))}
        </aside>
        <RichContent content={post.content} />
      </div>
      {related.length ? (
        <section className="related">
          <div className="section-head">
            <div>
              <span className="eyebrow">related</span>
              <h2>继续阅读</h2>
            </div>
          </div>
          <div className="post-grid">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

