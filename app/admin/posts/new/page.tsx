import { AdminShell } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const user = await requireAdmin();
  return (
    <AdminShell user={user}>
      <section className="admin-section">
        <div className="admin-head">
          <div>
            <span className="eyebrow">editor</span>
            <h1>新建文章</h1>
          </div>
        </div>
        <PostEditor />
      </section>
    </AdminShell>
  );
}

