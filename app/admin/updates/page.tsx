import { AdminShell } from "@/components/admin/AdminShell";
import { UpdatePanel } from "@/components/admin/UpdatePanel";
import { checkGithubUpdates } from "@/lib/admin/updates";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const user = await requireAdmin();
  const update = await checkGithubUpdates();
  return (
    <AdminShell user={user}>
      <UpdatePanel initial={update} />
    </AdminShell>
  );
}

