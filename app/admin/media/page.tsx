import { AdminShell } from "@/components/admin/AdminShell";
import { MediaManager } from "@/components/admin/MediaManager";
import { listMediaAssets } from "@/lib/admin/media";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const user = await requireAdmin();
  return (
    <AdminShell user={user}>
      <MediaManager initialMedia={listMediaAssets()} />
    </AdminShell>
  );
}

