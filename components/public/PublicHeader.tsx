import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";

export function PublicHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="public-header">
      <Link className="brand" href="/">
        <span className="brand-mark">MJ</span>
        <span>
          <strong>{settings.siteTitle}</strong>
          <small>self-hosted notes</small>
        </span>
      </Link>
      <nav aria-label="主导航">
        <Link href="/archive">归档</Link>
        <Link href="/admin">后台</Link>
      </nav>
    </header>
  );
}

