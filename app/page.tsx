import Link from "next/link";
import { listPublishedPosts, listTags } from "@/lib/content/posts";
import { getSettings } from "@/lib/settings";
import { getActiveTheme } from "@/lib/themes/registry";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = getSettings();
  const theme = getActiveTheme();
  const featured = listPublishedPosts({ featured: true, limit: 3 });
  const latest = listPublishedPosts({ limit: 8 });
  const tags = listTags();
  const PostCard = theme.PostCard;

  return (
    <div className="page-wrap">
      <section className="hero">
        <div>
          <span className="eyebrow">SELF HOSTED / HOMELAB / NOTES</span>
          <h1>{settings.siteTitle}</h1>
          <p>{settings.ownerBio}</p>
          <div className="hero-actions">
            <Link href="/archive">浏览文章</Link>
            <Link href="/admin">进入后台</Link>
          </div>
        </div>
        <aside className="hero-panel" aria-label="站点状态">
          <span>MANJYUN@NAS</span>
          <strong>遇到问题 → 搜索 → 动手 → 踩坑 → 解决</strong>
          <code>docker compose up -d</code>
          <code>/share/DockerData/ManJyun-Blog</code>
        </aside>
      </section>

      <section className="section-head">
        <div>
          <span className="eyebrow">featured</span>
          <h2>精选记录</h2>
        </div>
        <Link href="/archive">全部文章</Link>
      </section>
      <div className="post-grid">
        {(featured.length ? featured : latest.slice(0, 3)).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {!latest.length ? <EmptyPosts /> : null}
      </div>

      <section className="section-head">
        <div>
          <span className="eyebrow">latest</span>
          <h2>最近发布</h2>
        </div>
      </section>
      <div className="post-list">
        {latest.map((post) => (
          <PostCard key={post.id} post={post} compact />
        ))}
      </div>

      <section className="tag-cloud" aria-label="标签">
        <span>标签入口</span>
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            #{tag.name}
          </Link>
        ))}
      </section>
    </div>
  );
}

function EmptyPosts() {
  return (
    <div className="empty-state">
      <strong>还没有发布文章</strong>
      <p>进入后台创建第一篇 Markdown 笔记，发布后会出现在这里。</p>
    </div>
  );
}

