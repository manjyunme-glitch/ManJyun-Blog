"use client";

import { ChangeEvent, useState } from "react";
import type { MediaAssetRow } from "@/lib/db/types";

export function MediaManager({ initialMedia }: { initialMedia: MediaAssetRow[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPending(true);
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setMessage(data.message || "上传失败");
      return;
    }
    setMedia((items) => [data.media, ...items]);
    setMessage("已上传");
  }

  return (
    <section className="admin-section">
      <div className="admin-head">
        <div>
          <span className="eyebrow">media</span>
          <h1>媒体库</h1>
        </div>
        <label className="upload-button">
          {pending ? "上传中..." : "上传文件"}
          <input type="file" onChange={upload} />
        </label>
      </div>
      {message ? <p className="form-message">{message}</p> : null}
      <div className="media-grid">
        {media.map((item) => (
          <article key={item.id} className="media-item">
            {item.mime_type.startsWith("image/") ? <img src={item.url} alt={item.alt || ""} /> : <div className="file-tile">{item.mime_type}</div>}
            <strong>{item.original_name}</strong>
            <code>{item.url}</code>
            <button type="button" onClick={() => navigator.clipboard.writeText(item.url)}>
              复制 URL
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

