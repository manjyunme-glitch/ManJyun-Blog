import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireAdmin();
  return (
    <AdminShell user={user}>
      <section className="admin-section">
        <div className="admin-head">
          <div>
            <span className="eyebrow">site</span>
            <h1>站点设置</h1>
          </div>
        </div>
        <SettingsForm settings={getSettings()} />
      </section>
    </AdminShell>
  );
}

