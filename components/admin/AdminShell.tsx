import Link from "next/link";
import type { UserRow } from "@/lib/db/types";
import { LogoutButton } from "@/components/admin/LogoutButton";

const nav = [
  ["文章", "/admin/posts"],
  ["媒体", "/admin/media"],
  ["主题", "/admin/themes"],
  ["设置", "/admin/settings"],
  ["更新", "/admin/updates"]
];

export function AdminShell({ user, children }: { user: UserRow; children: React.ReactNode }) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin/posts">
          <span>MJ</span>
          <strong>ManJyun Admin</strong>
        </Link>
        <nav>
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-user">
          <small>{user.email}</small>
          <LogoutButton />
        </div>
      </aside>
      <section className="admin-main">{children}</section>
    </div>
  );
}

