"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/content/posts";
import { RichContent } from "@/components/public/RichContent";

const starter = `## 开始记录

这里写下这次折腾的背景、目标和踩坑过程。

\`\`\`bash
docker compose up -d
\`\`\`

{{< audio src="/media/example.mp3" title="背景音乐" caption="上传音频后替换这里的地址" >}}
`;

export function PostEditor({ post }: { post?: Post | null }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    status: post?.status || "draft",
    excerpt: post?.excerpt || "",
    content: post?.content || starter,
    coverImage: post?.coverImage || "",
    seoTitle: post?.seoTitle || "",
    seoDescription: post?.seoDescription || "",
    featured: post?.featured || false,
    publishedAt: post?.publishedAt || "",
    scheduledAt: post?.scheduledAt || "",
    tags: post?.tags.map((tag) => tag.name).join(", ") || ""
  });

  const endpoint = post ? `/api/admin/posts/${post.id}` : "/api/admin/posts";
  const method = post ? "PUT" : "POST";
  const tagList = useMemo(
    () =>
      form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [form.tags]
  );

  function setField(name: string, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function insert(text: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setField("content", `${form.content}\n${text}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${form.content.slice(0, start)}${text}${form.content.slice(end)}`;
    setField("content", next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + text.length;
      textarea.selectionEnd = start + text.length;
    });
  }

  async function upload(event: ChangeEvent<HTMLInputElement>, mode: "cover" | "insert") {
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
    if (mode === "cover") {
      setField("coverImage", data.media.url);
    } else if (file.type.startsWith("audio/")) {
      insert(`\n{{< audio src="${data.media.url}" title="${file.name}" >}}\n`);
    } else {
      insert(`\n{{< image src="${data.media.url}" alt="" caption="" >}}\n`);
    }
  }

  async function save() {
    setPending(true);
    setMessage("");
    const response = await fetch(endpoint, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: tagList,
        publishedAt: form.publishedAt || null,
        scheduledAt: form.scheduledAt || null
      })
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setMessage(data.message || "保存失败");
      return;
    }
    setMessage("已保存");
    router.push(`/admin/posts/${data.post.id}`);
    router.refresh();
  }

  async function remove() {
    if (!post || !confirm("确定删除这篇文章？")) return;
    await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <div className="editor-grid">
      <section className="editor-main">
        <input
          className="title-input"
          placeholder="文章标题"
          value={form.title}
          onChange={(event) => setField("title", event.target.value)}
        />
        <div className="card-toolbar">
          <button type="button" onClick={() => insert('\n{{< image src="/media/image.jpg" alt="" caption="" >}}\n')}>
            图片
          </button>
          <button
            type="button"
            onClick={() => insert('\n{{< gallery caption="图集" >}}\n/media/a.jpg|说明\n/media/b.jpg|说明\n{{< /gallery >}}\n')}
          >
            图集
          </button>
          <button type="button" onClick={() => insert('\n{{< audio src="/media/audio.mp3" title="音频" >}}\n')}>
            音频
          </button>
          <button type="button" onClick={() => insert('\n{{< video url="https://www.youtube.com/embed/..." title="视频" >}}\n')}>
            视频
          </button>
          <button type="button" onClick={() => insert('\n{{< bookmark url="https://example.com" title="链接标题" description="说明" >}}\n')}>
            书签
          </button>
          <button type="button" onClick={() => insert("\n```bash\n# command\n```\n")}>
            代码
          </button>
          <button type="button" onClick={() => insert("\n{{< html >}}\n<div>自定义 HTML</div>\n{{< /html >}}\n")}>
            HTML
          </button>
          <label className="upload-button">
            上传插入
            <input type="file" onChange={(event) => upload(event, "insert")} />
          </label>
        </div>
        <textarea
          ref={textareaRef}
          value={form.content}
          onChange={(event) => setField("content", event.target.value)}
          spellCheck={false}
        />
      </section>
      <aside className="editor-side">
        <div className="panel">
          <h2>发布设置</h2>
          <label>
            状态
            <select value={form.status} onChange={(event) => setField("status", event.target.value)}>
              <option value="draft">草稿</option>
              <option value="published">发布</option>
              <option value="scheduled">定时</option>
            </select>
          </label>
          <label>
            Slug
            <input value={form.slug} onChange={(event) => setField("slug", event.target.value)} placeholder="自动生成" />
          </label>
          <label>
            标签
            <input value={form.tags} onChange={(event) => setField("tags", event.target.value)} placeholder="Docker, NAS" />
          </label>
          <label>
            发布时间
            <input type="datetime-local" value={toLocal(form.publishedAt)} onChange={(event) => setField("publishedAt", fromLocal(event.target.value))} />
          </label>
          <label>
            定时时间
            <input type="datetime-local" value={toLocal(form.scheduledAt)} onChange={(event) => setField("scheduledAt", fromLocal(event.target.value))} />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.featured} onChange={(event) => setField("featured", event.target.checked)} />
            设为精选
          </label>
          <label>
            封面图 URL
            <input value={form.coverImage} onChange={(event) => setField("coverImage", event.target.value)} />
          </label>
          <label className="upload-button full">
            上传封面
            <input type="file" accept="image/*" onChange={(event) => upload(event, "cover")} />
          </label>
        </div>
        <div className="panel">
          <h2>摘要与 SEO</h2>
          <label>
            摘要
            <textarea value={form.excerpt} onChange={(event) => setField("excerpt", event.target.value)} />
          </label>
          <label>
            SEO 标题
            <input value={form.seoTitle} onChange={(event) => setField("seoTitle", event.target.value)} />
          </label>
          <label>
            SEO 描述
            <textarea value={form.seoDescription} onChange={(event) => setField("seoDescription", event.target.value)} />
          </label>
        </div>
        <div className="editor-actions">
          <button disabled={pending} onClick={save}>
            {pending ? "处理中..." : "保存"}
          </button>
          {post ? (
            <a href={`/posts/${post.slug}`} target="_blank">
              预览
            </a>
          ) : null}
          {post ? (
            <button className="danger" type="button" onClick={remove}>
              删除
            </button>
          ) : null}
        </div>
        {message ? <p className="form-message">{message}</p> : null}
      </aside>
      <section className="editor-preview">
        <h2>实时预览</h2>
        <RichContent content={form.content} />
      </section>
    </div>
  );
}

function toLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function fromLocal(value: string) {
  if (!value) return "";
  return new Date(value).toISOString();
}

