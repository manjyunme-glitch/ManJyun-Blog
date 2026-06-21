import Link from "next/link";
import { format } from "date-fns";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import type { BlogTheme, ThemePostCardProps, ThemePublicProps } from "@/lib/themes/types";

function PublicShell({ settings, children }: ThemePublicProps) {
  return (
    <div className="theme-shell theme-paper">
      <PublicHeader settings={settings} />
      <main>{children}</main>
      <PublicFooter settings={settings} />
    </div>
  );
}

function PostCard({ post, compact = false }: ThemePostCardProps) {
  const date = post.publishedAt || post.scheduledAt || post.createdAt;
  return (
    <article className={compact ? "post-card paper-card compact" : "post-card paper-card"}>
      <div>
        <div className="post-meta">
          <time dateTime={date}>{format(new Date(date), "yyyy.MM.dd")}</time>
          <span>{post.readingMinutes} min read</span>
        </div>
        <h2>
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>
        {!compact ? <p>{post.excerpt}</p> : null}
        <div className="tag-row">
          {post.tags.slice(0, 3).map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.slug}`}>
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

export const paperTheme: BlogTheme = {
  config: {
    id: "paper",
    name: "Paper Trail",
    description: "偏出版物的轻量纸面主题，用来验证主题切换接口。",
    version: "1.0.0",
    tokens: {
      background: "#fbfaf6",
      foreground: "#171514",
      muted: "#6d625a",
      surface: "#ffffff",
      border: "#ded8ce",
      accent: "#8a3f2b",
      accentSoft: "#f3e2d9",
      codeBg: "#201b18",
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

