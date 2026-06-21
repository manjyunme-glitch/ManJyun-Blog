"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { parseContentBlocks, type ContentBlock } from "@/lib/content/cards";
import { makeSlug } from "@/lib/content/markdown";

export function RichContent({ content }: { content: string }) {
  const blocks = parseContentBlocks(content);
  const seen = new Map<string, number>();

  return (
    <div className="rich-content">
      {blocks.map((block, index) => (
        <ContentBlockView key={index} block={block} seen={seen} />
      ))}
    </div>
  );
}

function ContentBlockView({ block, seen }: { block: ContentBlock; seen: Map<string, number> }) {
  if (block.type === "markdown") {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          h2({ children, ...props }) {
            const id = headingId(children, seen);
            return (
              <h2 id={id} {...props}>
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            const id = headingId(children, seen);
            return (
              <h3 id={id} {...props}>
                {children}
              </h3>
            );
          }
        }}
      >
        {block.body}
      </ReactMarkdown>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="media-card image-card">
        <img src={block.attrs.src} alt={block.attrs.alt || ""} />
        {block.attrs.caption ? <figcaption>{block.attrs.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === "gallery") {
    return (
      <figure className="media-card gallery-card">
        <div>
          {block.items.map((item) => (
            <img key={item.src} src={item.src} alt={item.caption || ""} />
          ))}
        </div>
        {block.attrs.caption ? <figcaption>{block.attrs.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === "audio") {
    return (
      <figure className="media-card audio-card">
        <figcaption>
          <strong>{block.attrs.title || "音频"}</strong>
          {block.attrs.caption ? <span>{block.attrs.caption}</span> : null}
        </figcaption>
        <audio controls preload="metadata" src={block.attrs.src} />
      </figure>
    );
  }

  if (block.type === "video") {
    return (
      <figure className="media-card video-card">
        <iframe src={block.attrs.url || block.attrs.src} title={block.attrs.title || "嵌入视频"} allowFullScreen />
        {block.attrs.caption ? <figcaption>{block.attrs.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === "bookmark") {
    return (
      <a className="bookmark-card" href={block.attrs.url} target="_blank" rel="noreferrer">
        <span>{block.attrs.title || block.attrs.url}</span>
        {block.attrs.description ? <small>{block.attrs.description}</small> : null}
      </a>
    );
  }

  if (block.type === "html") {
    return <div className="html-card" dangerouslySetInnerHTML={{ __html: block.body }} />;
  }

  return null;
}

function headingId(children: React.ReactNode, seen: Map<string, number>) {
  const text = flattenText(children);
  const base = makeSlug(text, "section");
  const count = seen.get(base) || 0;
  seen.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

function flattenText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  return "";
}
