import Link from "next/link";
import { format } from "date-fns";
import { AdminShell } from "@/components/admin/AdminShell";
import { listAdminPosts } from "@/lib/content/posts";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const user = await requireAdmin();
  const posts = listAdminPosts();
  return (
    <AdminShell user={user}>
      <section className="admin-section">
        <div className="admin-head">
          <div>
            <span className="eyebrow">content</span>
            <h1>文章管理</h1>
          </div>
          <Link className="primary-button" href="/admin/posts/new">
            新建文章
          </Link>
        </div>
        <div className="admin-table">
          {posts.map((post) => (
            <Link key={post.id} className="admin-row" href={`/admin/posts/${post.id}`}>
              <strong>{post.title}</strong>
              <span>{post.status}</span>
              <span>{post.tags.map((tag) => tag.name).join(", ") || "未标记"}</span>
              <time>{format(new Date(post.updatedAt), "yyyy.MM.dd HH:mm")}</time>
            </Link>
          ))}
          {!posts.length ? <p className="empty-inline">还没有文章。先创建第一篇 Markdown 笔记。</p> : null}
        </div>
      </section>
    </AdminShell>
  );
}

