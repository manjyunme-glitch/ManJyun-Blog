import type { SiteSettings } from "@/lib/settings";

export function PublicFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="public-footer">
      <p>{settings.ownerName} 的自托管博客。文章、图片和音频都保存在自己的 Docker 数据目录里。</p>
      <span>{new Date().getFullYear()} / ManJyun Blog</span>
    </footer>
  );
}

