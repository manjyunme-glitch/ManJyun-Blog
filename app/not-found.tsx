import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-wrap narrow">
      <section className="archive-head">
        <span className="eyebrow">404</span>
        <h1>没有找到这页</h1>
        <p>可能是文章还没发布，或者链接已经改名。</p>
        <Link href="/">回到首页</Link>
      </section>
    </div>
  );
}

