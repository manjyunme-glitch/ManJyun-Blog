import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";
import { getPostById } from "@/lib/content/posts";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const user = await requireAdmin();
  const { id } = await params;
  const post = getPostById(id);
  if (!post) notFound();
  return (
    <AdminShell user={user}>
      <section className="admin-section">
        <div className="admin-head">
          <div>
            <span className="eyebrow">editor</span>
            <h1>编辑文章</h1>
          </div>
        </div>
        <PostEditor post={post} />
      </section>
    </AdminShell>
  );
}

