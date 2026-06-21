import Link from "next/link";
import { format } from "date-fns";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import type { BlogTheme, ThemePostCardProps, ThemePublicProps } from "@/lib/themes/types";

function PublicShell({ settings, children }: ThemePublicProps) {
  return (
    <div className="theme-shell theme-workbench">
      <div className="network-grid" aria-hidden="true" />
      <PublicHeader settings={settings} />
      <main>{children}</main>
      <PublicFooter settings={settings} />
    </div>
  );
}

function PostCard({ post, compact = false }: ThemePostCardProps) {
  const date = post.publishedAt || post.scheduledAt || post.createdAt;
  return (
    <article className={compact ? "post-card compact" : "post-card"}>
      {post.coverImage ? <img src={post.coverImage} alt="" /> : <div className="post-card-fallback">log</div>}
      <div>
        <div className="post-meta">
          <time dateTime={date}>{format(new Date(date), "yyyy.MM.dd")}</time>
          <span>{post.readingMinutes} min</span>
        </div>
        <h2>
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>
        {!compact ? <p>{post.excerpt}</p> : null}
        <div className="tag-row">
          {post.tags.slice(0, 3).map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.slug}`}>
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

export const workbenchTheme: BlogTheme = {
  config: {
    id: "workbench",
    name: "Workbench",
    description: "安静的 homelab 工作台主题，适合长文、代码和自托管笔记。",
    version: "1.0.0",
    tokens: {
      background: "#0a0a0a",
      foreground: "#ece7dd",
      muted: "#a29b8b",
      surface: "#171512",
      border: "#38332a",
      accent: "#e8a84c",
      accentSoft: "rgba(232, 168, 76, 0.14)",
      codeBg: "#0f1110",
      fontSans:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif',
      fontSerif: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif',
      fontMono: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace'
    },
    supportedCards: ["markdown", "image", "gallery", "audio", "video", "bookmark", "html", "code"]
  },
  PublicShell,
  PostCard
};
