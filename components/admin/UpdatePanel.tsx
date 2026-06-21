"use client";

import { useState } from "react";
import type { UpdateStatus } from "@/lib/admin/updates";

export function UpdatePanel({ initial }: { initial: UpdateStatus }) {
  const [update, setUpdate] = useState(initial);
  const [pending, setPending] = useState(false);

  async function refresh() {
    setPending(true);
    const response = await fetch("/api/admin/updates");
    const data = await response.json();
    setPending(false);
    if (response.ok) setUpdate(data.update);
  }

  return (
    <section className="update-panel">
      <div className="admin-head">
        <div>
          <span className="eyebrow">github</span>
          <h1>更新检查</h1>
        </div>
        <button onClick={refresh}>{pending ? "检查中..." : "重新检查"}</button>
      </div>
      <div className="status-grid">
        <div>
          <span>当前版本</span>
          <strong>{update.currentVersion}</strong>
        </div>
        <div>
          <span>当前 Commit</span>
          <strong>{update.currentCommit}</strong>
        </div>
        <div>
          <span>仓库</span>
          <strong>
            {update.owner}/{update.repo}
          </strong>
        </div>
        <div>
          <span>检查时间</span>
          <strong>{new Date(update.checkedAt).toLocaleString()}</strong>
        </div>
      </div>
      <article className="panel">
        <h2>GitHub 状态</h2>
        <p>{update.message}</p>
        {update.latestRelease ? (
          <p>
            最新 Release：<a href={update.latestRelease.url}>{update.latestRelease.name}</a>
          </p>
        ) : (
          <p>没有读取到 Release。初始项目可以先用 main 分支部署。</p>
        )}
        {update.latestCommit ? (
          <p>
            最新 Commit：<a href={update.latestCommit.url}>{update.latestCommit.sha.slice(0, 7)}</a> /{" "}
            {update.latestCommit.message.split("\n")[0]}
          </p>
        ) : null}
      </article>
      <article className="panel">
        <h2>Portainer 更新方式</h2>
        <p>此页面只读检查 GitHub，不会在容器内自动改代码或重启服务。需要更新时，在 Portainer 的 Git Stack 页面拉取最新仓库并重新部署。</p>
      </article>
    </section>
  );
}

