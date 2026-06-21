import { AdminShell } from "@/components/admin/AdminShell";
import { ThemeManager } from "@/components/admin/ThemeManager";
import { requireAdmin } from "@/lib/auth/guards";
import { getSettings } from "@/lib/settings";
import { listThemes } from "@/lib/themes/registry";

export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  const user = await requireAdmin();
  return (
    <AdminShell user={user}>
      <section className="admin-section">
        <div className="admin-head">
          <div>
            <span className="eyebrow">themes</span>
            <h1>主题管理</h1>
          </div>
        </div>
        <ThemeManager themes={listThemes()} activeTheme={getSettings().activeTheme} />
      </section>
    </AdminShell>
  );
}

